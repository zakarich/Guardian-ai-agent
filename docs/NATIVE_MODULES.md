# Native Audio Modules - Production Implementation

## Overview

The current MVP uses `expo-av` for audio recording, which is sufficient for demonstration but lacks the advanced features required for production. This document outlines the native module implementation needed for:

1. **24-hour circular buffer** with AES-GCM encryption
2. **Voice Activity Detection (VAD)** using Silero
3. **Wake word detection** using Porcupine
4. **Speaker diarization** using ECAPA-TDNN
5. **On-device ASR** using whisper.cpp

## Architecture

```
React Native (JS)
       ↓
Native Bridge (C++/Rust)
       ↓
┌──────┴──────┬─────────┬──────────┐
↓             ↓         ↓          ↓
Audio      VAD/KWS   Encryption  Storage
Engine                           (Circular Buffer)
```

## iOS Implementation

### 1. Audio Capture (Swift + AVAudioEngine)

```swift
// ios/GuardianAudio/AudioCapture.swift
import AVFoundation

class AudioCapture {
    private let audioEngine = AVAudioEngine()
    private let circularBuffer: CircularBuffer
    
    func startCapture() {
        let inputNode = audioEngine.inputNode
        let format = inputNode.outputFormat(forBus: 0)
        
        inputNode.installTap(onBus: 0, bufferSize: 4096, format: format) { [weak self] buffer, time in
            guard let self = self else { return }
            
            // Process audio chunk
            let audioData = self.bufferToData(buffer)
            
            // Run VAD
            if self.vadDetector.isVoice(audioData) {
                // Encrypt and store
                let encrypted = self.encryptor.encrypt(audioData)
                self.circularBuffer.append(encrypted)
            }
        }
        
        audioEngine.prepare()
        try? audioEngine.start()
    }
}
```

### 2. Circular Buffer with Encryption

```swift
// ios/GuardianAudio/CircularBuffer.swift
import CryptoKit

class CircularBuffer {
    private var buffer: [Data] = []
    private let maxDuration: TimeInterval = 24 * 3600 // 24 hours
    private let key: SymmetricKey
    
    init() {
        // Generate or retrieve key from Keychain
        self.key = try! SymmetricKey(size: .bits256)
    }
    
    func append(_ data: Data) {
        let encrypted = try! AES.GCM.seal(data, using: key)
        buffer.append(encrypted.combined!)
        
        // Remove old data if exceeds TTL
        pruneOldData()
    }
    
    func extract(duration: TimeInterval) -> Data? {
        // Extract last N seconds, decrypt, and concatenate
        let chunks = buffer.suffix(Int(duration * 16)) // 16kHz sample rate
        return chunks.compactMap { try? AES.GCM.open(.init(combined: $0), using: key) }
            .reduce(Data(), +)
    }
    
    func nuke() {
        buffer.removeAll()
    }
}
```

### 3. React Native Bridge

```objc
// ios/GuardianAudio/GuardianAudioBridge.m
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(GuardianAudio, NSObject)

RCT_EXTERN_METHOD(startListening:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stopListening:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(extractSegment:(double)duration
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(nukeData:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
```

## Android Implementation

### 1. Audio Capture (Kotlin + AudioRecord)

```kotlin
// android/app/src/main/java/com/guardian/audio/AudioCapture.kt
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder

class AudioCapture(private val circularBuffer: CircularBuffer) {
    private val sampleRate = 16000
    private val channelConfig = AudioFormat.CHANNEL_IN_MONO
    private val audioFormat = AudioFormat.ENCODING_PCM_16BIT
    private val bufferSize = AudioRecord.getMinBufferSize(sampleRate, channelConfig, audioFormat)
    
    private var audioRecord: AudioRecord? = null
    private var isRecording = false
    
    fun startCapture() {
        audioRecord = AudioRecord(
            MediaRecorder.AudioSource.MIC,
            sampleRate,
            channelConfig,
            audioFormat,
            bufferSize
        )
        
        audioRecord?.startRecording()
        isRecording = true
        
        Thread {
            val buffer = ShortArray(bufferSize)
            while (isRecording) {
                val read = audioRecord?.read(buffer, 0, bufferSize) ?: 0
                if (read > 0) {
                    // Process audio chunk
                    processAudio(buffer.take(read).toShortArray())
                }
            }
        }.start()
    }
    
    private fun processAudio(data: ShortArray) {
        // Run VAD
        if (vadDetector.isVoice(data)) {
            // Encrypt and store
            val encrypted = encryptor.encrypt(data)
            circularBuffer.append(encrypted)
        }
    }
}
```

### 2. Encryption (Kotlin + AndroidKeyStore)

```kotlin
// android/app/src/main/java/com/guardian/audio/Encryptor.kt
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties

class Encryptor {
    private val keyAlias = "guardian_audio_key"
    private val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
    
    private fun getOrCreateKey(): SecretKey {
        if (!keyStore.containsAlias(keyAlias)) {
            val keyGenerator = KeyGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_AES,
                "AndroidKeyStore"
            )
            keyGenerator.init(
                KeyGenParameterSpec.Builder(
                    keyAlias,
                    KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
                )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .build()
            )
            return keyGenerator.generateKey()
        }
        return keyStore.getKey(keyAlias, null) as SecretKey
    }
    
    fun encrypt(data: ShortArray): ByteArray {
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey())
        return cipher.doFinal(data.toByteArray())
    }
}
```

## ML Model Integration

### 1. Silero VAD (ONNX Runtime)

```cpp
// native/vad/silero_vad.cpp
#include <onnxruntime/core/session/onnxruntime_cxx_api.h>

class SileroVAD {
private:
    Ort::Env env;
    Ort::Session session;
    
public:
    SileroVAD(const std::string& model_path) 
        : env(ORT_LOGGING_LEVEL_WARNING, "SileroVAD"),
          session(env, model_path.c_str(), Ort::SessionOptions{}) {}
    
    bool isVoice(const std::vector<float>& audio_chunk) {
        // Prepare input tensor
        std::vector<int64_t> input_shape = {1, static_cast<int64_t>(audio_chunk.size())};
        auto memory_info = Ort::MemoryInfo::CreateCpu(OrtArenaAllocator, OrtMemTypeDefault);
        Ort::Value input_tensor = Ort::Value::CreateTensor<float>(
            memory_info, 
            const_cast<float*>(audio_chunk.data()), 
            audio_chunk.size(), 
            input_shape.data(), 
            input_shape.size()
        );
        
        // Run inference
        auto output_tensors = session.Run(
            Ort::RunOptions{nullptr},
            &"input", &input_tensor, 1,
            &"output", 1
        );
        
        float* output = output_tensors.front().GetTensorMutableData<float>();
        return output[0] > 0.5; // Threshold
    }
};
```

### 2. Porcupine Wake Word

```swift
// ios/GuardianAudio/WakeWordDetector.swift
import Porcupine

class WakeWordDetector {
    private var porcupine: Porcupine?
    
    init() {
        do {
            porcupine = try Porcupine(
                accessKey: "YOUR_PICOVOICE_KEY",
                keywords: [.hey_siri, .alexa] // Custom: "Hey Guardian"
            )
        } catch {
            print("Failed to initialize Porcupine: \(error)")
        }
    }
    
    func process(_ audioFrame: [Int16]) -> Bool {
        do {
            let keywordIndex = try porcupine?.process(audioFrame)
            return keywordIndex != nil && keywordIndex! >= 0
        } catch {
            return false
        }
    }
}
```

## Usage in React Native

```typescript
// services/nativeAudio.ts
import { NativeModules } from 'react-native';

const { GuardianAudio } = NativeModules;

export class NativeAudioService {
    async startListening(): Promise<void> {
        await GuardianAudio.startListening();
    }
    
    async stopListening(): Promise<void> {
        await GuardianAudio.stopListening();
    }
    
    async extractSegment(duration: number): Promise<string> {
        // Returns base64-encoded audio
        return await GuardianAudio.extractSegment(duration);
    }
    
    async nukeData(): Promise<void> {
        await GuardianAudio.nukeData();
    }
}
```

## Performance Targets

- **VAD Latency**: < 10ms per chunk
- **Encryption**: < 5ms per chunk
- **Wake Word Detection**: < 50ms
- **Memory Usage**: < 500MB for 24h buffer
- **Battery Impact**: < 5% per hour

## Testing

```swift
// ios/GuardianAudioTests/CircularBufferTests.swift
import XCTest

class CircularBufferTests: XCTestCase {
    func testAppendAndExtract() {
        let buffer = CircularBuffer()
        let testData = Data(repeating: 0x42, count: 1024)
        
        buffer.append(testData)
        let extracted = buffer.extract(duration: 1.0)
        
        XCTAssertNotNil(extracted)
        XCTAssertEqual(extracted?.count, 1024)
    }
    
    func testNuke() {
        let buffer = CircularBuffer()
        buffer.append(Data(repeating: 0x42, count: 1024))
        buffer.nuke()
        
        let extracted = buffer.extract(duration: 1.0)
        XCTAssertNil(extracted)
    }
}
```

## Build Configuration

### iOS (Podfile)
```ruby
pod 'Porcupine-iOS', '~> 3.0'
pod 'onnxruntime-objc', '~> 1.16'
```

### Android (build.gradle)
```gradle
dependencies {
    implementation 'ai.picovoice:porcupine-android:3.0.0'
    implementation 'com.microsoft.onnxruntime:onnxruntime-android:1.16.0'
}
```

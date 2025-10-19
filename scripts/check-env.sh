#!/usr/bin/env bash
# Quick environment SDK/tool checker for Guardian AI (macOS/zsh)
# Run: ./scripts/check-env.sh

set -euo pipefail

print_status() {
  local name="$1"
  local ok="$2"
  if [ "$ok" = true ]; then
    printf "\e[32m[OK]     %s\e[0m\n" "$name"
  else
    printf "\e[31m[MISSING] %s\e[0m\n" "$name"
  fi
}

check_cmd() {
  local cmd="$1"
  if command -v "$cmd" >/dev/null 2>&1; then
    printf "  %s -> %s\n" "$cmd" "$(command -v $cmd)"
    $cmd --version 2>/dev/null || true
    return 0
  fi
  return 1
}

echo "Guardian AI — environment quick-check"
echo

# Node / npm
if check_cmd node >/dev/null 2>&1; then
  print_status "Node.js (>=18)" true
  node --version
else
  print_status "Node.js (>=18)" false
fi

if check_cmd npm >/dev/null 2>&1; then
  print_status "npm" true
  npm --version
else
  print_status "npm" false
fi

echo
# Python
if check_cmd python3 >/dev/null 2>&1; then
  PY_VER=$(python3 -c 'import sys; print("{}.{}.{}".format(*sys.version_info[:3]))')
  if [[ ${PY_VER%%.*} -ge 3 ]]; then
    print_status "Python 3 (>=3.11 recommended)" true
    echo "  python3 -> $PY_VER"
  else
    print_status "Python 3 (too old)" false
    echo "  python3 -> $PY_VER"
  fi
else
  print_status "Python 3" false
fi

if check_cmd pip3 >/dev/null 2>&1; then
  print_status "pip" true
  pip3 --version
else
  print_status "pip" false
fi

echo
# Docker & Compose
if check_cmd docker >/dev/null 2>&1; then
  print_status "Docker" true
  docker --version
else
  print_status "Docker" false
fi

if check_cmd docker-compose >/dev/null 2>&1; then
  print_status "Docker Compose (v1)" true
  docker-compose --version
else
  # Docker Compose v2 is a docker subcommand
  if docker compose version >/dev/null 2>&1; then
    print_status "Docker Compose (v2)" true
    docker compose version
  else
    print_status "Docker Compose" false
  fi
fi

echo
# Xcode / CocoaPods
if check_cmd xcodebuild >/dev/null 2>&1; then
  print_status "Xcode (xcodebuild)" true
  # xcodebuild may require full Xcode; don't let a failing version check abort the script
  xcodebuild -version 2>/dev/null || true
else
  print_status "Xcode" false
fi

if check_cmd pod >/dev/null 2>&1; then
  print_status "CocoaPods" true
  pod --version
else
  print_status "CocoaPods" false
fi

echo
# Java / Android
if check_cmd java >/dev/null 2>&1; then
  print_status "Java (JDK)" true
  java -version 2>&1 | head -n 1
else
  print_status "Java (JDK)" false
fi

if check_cmd javac >/dev/null 2>&1; then
  print_status "javac" true
  javac -version 2>&1 || true
else
  print_status "javac" false
fi

if check_cmd adb >/dev/null 2>&1; then
  print_status "Android platform-tools (adb)" true
  adb --version || true
else
  print_status "Android platform-tools (adb)" false
fi

if check_cmd gradle >/dev/null 2>&1; then
  print_status "Gradle" true
  gradle --version | head -n 1
else
  print_status "Gradle (optional)" false
fi

echo
# Expo / EAS
if check_cmd npm >/dev/null 2>&1 && npm list -g expo-cli >/dev/null 2>&1; then
  print_status "expo-cli (global)" true
else
  # modern projects use 'expo' package via npx; still check for EAS
  print_status "expo-cli (global)" false
fi

if check_cmd eas >/dev/null 2>&1; then
  print_status "EAS CLI" true
  eas --version
else
  print_status "EAS CLI (optional for production)" false
fi

echo
# Homebrew
if check_cmd brew >/dev/null 2>&1; then
  print_status "Homebrew" true
  brew --version | head -n 1
else
  print_status "Homebrew" false
fi

echo
# Postgres / pgvector hint
if check_cmd psql >/dev/null 2>&1; then
  print_status "psql (PostgreSQL client)" true
  psql --version
else
  print_status "psql (PostgreSQL client)" false
fi

# Check for native directories (to indicate native module work)
if [ -d ios ] || [ -d android ]; then
  print_status "iOS/Android native projects present" true
else
  print_status "iOS/Android native projects (expo-managed)" false
fi

echo
echo "The repository's docs reference several native ML SDKs and model runtimes that can't be auto-detected here:"
# Notes about ML/native SDKs
echo "The repository's docs reference several native ML SDKs and model runtimes that can't be auto-detected here:"
cat <<'EOH'
  - Porcupine (Picovoice) SDK (iOS/Android)
  - ONNX Runtime (mobile) for Silero VAD
  - whisper.cpp (C/C++) for on-device ASR
  - ECAPA-TDNN models for diarization
  - pgvector extension for PostgreSQL (usually installed inside Docker/postgres)

Use the Docker Compose stack (backend/docker-compose.yml) to get a Postgres + pgvector instance locally, or follow the DEPLOYMENT.md steps to install pgvector system-wide.
EOH

echo
printf "Summary: the script reports presence/absence of common SDKs and CLIs.\n"
printf "If you want, I can:\n  - add more environment checks (e.g. ONNX, Porcupine model files)\n  - or generate macOS Homebrew install commands for any missing items.\n"


# -------------------------------
# Additional best-effort checks
# -------------------------------
echo
echo "Additional checks (ML/native runtimes)"

# ONNX Runtime (Python package)
if python3 -c "import importlib.util; exit(0) if importlib.util.find_spec('onnxruntime') else exit(1)" 2>/dev/null; then
  print_status "ONNX Runtime (python 'onnxruntime')" true
  python3 -c "import onnxruntime as ort; print('  onnxruntime', getattr(ort, '__version__', 'unknown'))" 2>/dev/null || true
else
  print_status "ONNX Runtime (python 'onnxruntime')" false
fi

# Porcupine / Picovoice references in repository
if grep -R --line-number -E "porcupine|picovoice" . >/dev/null 2>&1; then
  print_status "Porcupine / Picovoice references in repository" true
else
  print_status "Porcupine / Picovoice references in repository" false
fi

# whisper.cpp (on-device ASR) presence check (best-effort)
if [ -d "whisper.cpp" ] || [ -d "backend/whisper.cpp" ] || ls | grep -E "whisper(\.cpp)?" >/dev/null 2>&1; then
  print_status "whisper.cpp (on-device ASR) checkout/build" true
else
  # look for common ggml model files
  if ls **/*.ggml.* 2>/dev/null | grep -q .; then
    print_status "whisper.cpp / ggml model files" true
  else
    print_status "whisper.cpp (on-device ASR)" false
  fi
fi

echo
printf "Note: native ML SDKs often require platform-specific setup (C/C++ builds, Pod installs for iOS, or Android native libs).\n"

exit 0

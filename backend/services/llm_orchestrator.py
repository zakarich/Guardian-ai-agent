"""
LLM Orchestrator - Multi-provider reasoning engine
Routes requests to GPT-4o, Claude, or Gemini based on intent
"""
from typing import Dict, Literal
import openai
import anthropic

IntentType = Literal['medical', 'financial', 'legal', 'general']

class LLMOrchestrator:
    def __init__(self, openai_key: str, anthropic_key: str):
        self.openai_client = openai.OpenAI(api_key=openai_key)
        self.anthropic_client = anthropic.Anthropic(api_key=anthropic_key)
    
    async def generate_guidance(
        self,
        transcript: str,
        intent: IntentType,
        context: Dict
    ) -> Dict:
        """
        Generate contextual guidance based on conversation
        
        Args:
            transcript: Conversation text
            intent: Classified intent (medical/financial/legal/general)
            context: Additional metadata (speakers, duration, etc.)
        
        Returns:
            {
                'content': str,
                'type': str,
                'confidence': float
            }
        """
        
        # Route to appropriate provider
        if intent == 'medical':
            return await self._claude_reasoning(transcript, intent, context)
        elif intent == 'legal':
            return await self._gpt4_reasoning(transcript, intent, context)
        else:
            return await self._gpt4_reasoning(transcript, intent, context)
    
    async def _gpt4_reasoning(self, transcript: str, intent: str, context: Dict) -> Dict:
        """GPT-4o for legal and general reasoning"""
        
        prompt = self._build_prompt(transcript, intent, context)
        
        response = self.openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": self._get_system_prompt(intent)},
                {"role": "user", "content": prompt}
            ],
            max_tokens=100,
            temperature=0.7
        )
        
        content = response.choices[0].message.content
        
        return {
            'content': content,
            'type': self._determine_type(intent),
            'confidence': 0.95
        }
    
    async def _claude_reasoning(self, transcript: str, intent: str, context: Dict) -> Dict:
        """Claude 3.5 Sonnet for medical reasoning"""
        
        prompt = self._build_prompt(transcript, intent, context)
        
        message = self.anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=100,
            messages=[
                {"role": "user", "content": prompt}
            ],
            system=self._get_system_prompt(intent)
        )
        
        content = message.content[0].text
        
        return {
            'content': content,
            'type': 'suggestion',
            'confidence': 0.93
        }
    
    def _get_system_prompt(self, intent: str) -> str:
        """Get intent-specific system prompt"""
        prompts = {
            'medical': "You are a protective AI guardian helping users understand medical conversations. Provide brief, actionable suggestions (max 30 words). Focus on patient safety and informed consent.",
            'financial': "You are a protective AI guardian helping users understand financial discussions. Identify potential hidden costs or unfavorable terms. Be concise (max 30 words).",
            'legal': "You are a protective AI guardian helping users in legal situations. Emphasize rights and suggest seeking professional counsel when appropriate. Be concise (max 30 words).",
            'general': "You are a helpful AI guardian. Provide brief, contextual guidance (max 30 words)."
        }
        return prompts.get(intent, prompts['general'])
    
    def _build_prompt(self, transcript: str, intent: str, context: Dict) -> str:
        """Build context-aware prompt"""
        return f"""
Conversation transcript:
{transcript}

Context: {intent} discussion with {context.get('speakers', 1)} speaker(s)
Duration: {context.get('duration', 0)} seconds

Provide ONE brief, actionable suggestion for the user.
"""
    
    def _determine_type(self, intent: str) -> str:
        """Map intent to guidance type"""
        mapping = {
            'medical': 'suggestion',
            'financial': 'warning',
            'legal': 'warning',
            'general': 'clarification'
        }
        return mapping.get(intent, 'clarification')

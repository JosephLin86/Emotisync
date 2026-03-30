const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

async function analyzeJournalEntry(journalText) {
    try {
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            messages: [{
                role: 'user',
                content: `You are a mental health data analyst. Analyze this journal entry and return ONLY a JSON object with no additional text.

Journal Entry:
"${journalText}"

Return JSON in this exact format:
{
  "summary": "brief 1-sentence summary",
  "sentiment": <number between -1 and 1>,
  "emotions": ["emotion1", "emotion2"],
  "intensity": <number 1-10>,
  "riskFlags": ["flag1", "flag2"] or [],
  "suggestedFollowUp": "optional question or empty string"
}

Sentiment scale: -1 (very negative) to 1 (very positive)
Intensity: 1 (low) to 10 (high emotional intensity)
Common emotions: anxiety, stress, joy, sadness, anger, fear, hope, contentment
Common risk flags: burnout, isolation, self-harm-mention, severe-distress (only if clearly present)

Return ONLY the JSON, no explanation.`
            }]
        });
        
        // Extract JSON from response
        const responseText = message.content[0].text;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error('No valid JSON found in AI response');
        }
        
        const analysis = JSON.parse(jsonMatch[0]);
        
        // Validate structure
        if (!analysis.summary || typeof analysis.sentiment !== 'number' || 
            !Array.isArray(analysis.emotions) || typeof analysis.intensity !== 'number') {
            throw new Error('Invalid analysis structure');
        }
        
        return analysis;
        
    } catch (err) {
        console.error('AI analysis error:', err);
        throw err;
    }
}

module.exports = { analyzeJournalEntry };
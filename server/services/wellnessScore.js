const { computeTrends } = require('./aggregation');

async function calculateWellnessScore(roomId, days = 30) {
    try {
        const trends = await computeTrends(roomId, days);
        
        // Base score starts at 50 (neutral)
        let score = 50;
        let factors = [];
        let confidence = 'low';
        
        // Check if we have enough data
        const totalDataPoints = trends.dataPoints.moodEntries + trends.dataPoints.journalAnalyses;
        
        if (totalDataPoints === 0) {
            return {
                score: null,
                trend: 'insufficient_data',
                confidence: 'none',
                factors: ['No mood or journal data available'],
                message: 'Need at least one mood entry or journal to generate insights'
            };
        }
        
        if (totalDataPoints < 3) {
            confidence = 'low';
        } else if (totalDataPoints < 10) {
            confidence = 'medium';
        } else {
            confidence = 'high';
        }
        
        // Factor 1: Average Mood Score (weight: 30%)
        if (trends.averageMoodScore !== null) {
            // Map 1-10 scale to -15 to +15 impact
            const moodImpact = (trends.averageMoodScore - 5.5) * 3;
            score += moodImpact;
            
            if (trends.averageMoodScore >= 7) {
                factors.push(`Positive mood scores (avg: ${trends.averageMoodScore.toFixed(1)}/10)`);
            } else if (trends.averageMoodScore <= 4) {
                factors.push(`Low mood scores (avg: ${trends.averageMoodScore.toFixed(1)}/10)`);
            }
        }
        
        // Factor 2: Sentiment Analysis (weight: 25%)
        if (trends.averageSentiment !== null) {
            // Map -1 to 1 scale to -12.5 to +12.5 impact
            const sentimentImpact = trends.averageSentiment * 12.5;
            score += sentimentImpact;
            
            if (trends.averageSentiment >= 0.3) {
                factors.push(`Positive journal sentiment (${(trends.averageSentiment * 100).toFixed(0)}%)`);
            } else if (trends.averageSentiment <= -0.3) {
                factors.push(`Negative journal sentiment (${(trends.averageSentiment * 100).toFixed(0)}%)`);
            }
        }
        
        // Factor 3: Stress Level (weight: 20%)
        if (trends.averageStress !== null) {
            // Map 1-10 scale to -10 to +10 impact (inverted - high stress is bad)
            const stressImpact = (5.5 - trends.averageStress) * 2;
            score += stressImpact;
            
            if (trends.averageStress >= 7) {
                factors.push(`Elevated stress levels (avg: ${trends.averageStress.toFixed(1)}/10)`);
            } else if (trends.averageStress <= 3) {
                factors.push(`Low stress levels (avg: ${trends.averageStress.toFixed(1)}/10)`);
            }
        }
        
        // Factor 4: Energy Level (weight: 10%)
        if (trends.averageEnergy !== null) {
            // Map 1-10 scale to -5 to +5 impact
            const energyImpact = (trends.averageEnergy - 5.5) * 1;
            score += energyImpact;
            
            if (trends.averageEnergy >= 7) {
                factors.push(`Good energy levels (avg: ${trends.averageEnergy.toFixed(1)}/10)`);
            } else if (trends.averageEnergy <= 3) {
                factors.push(`Low energy levels (avg: ${trends.averageEnergy.toFixed(1)}/10)`);
            }
        }
        
        // Factor 5: Emotional Volatility (weight: 10%)
        if (trends.moodVolatility > 0) {
            // High volatility is concerning
            const volatilityImpact = Math.min(trends.moodVolatility * -2, 0);
            score += volatilityImpact;
            
            if (trends.moodVolatility > 2) {
                factors.push(`High emotional volatility (variance: ${trends.moodVolatility.toFixed(1)})`);
            }
        }
        
        // Factor 6: Negative Emotion Frequency (weight: 5%)
        if (trends.negativeEmotionFrequency > 0.5) {
            const negativeImpact = trends.negativeEmotionFrequency * -2.5;
            score += negativeImpact;
            factors.push(`Frequent negative emotions (${(trends.negativeEmotionFrequency * 100).toFixed(0)}% of entries)`);
        }
        
        // Factor 7: Risk Flags (critical)
        const criticalFlags = ['self-harm-mention', 'severe-distress', 'suicidal-ideation'];
        const hasCriticalFlags = Object.keys(trends.riskFlagCounts).some(flag => 
            criticalFlags.includes(flag)
        );
        
        if (hasCriticalFlags) {
            score -= 15; // Significant penalty
            factors.push('⚠️ Critical risk flags detected - immediate attention recommended');
        }
        
        // Add other risk flags
        const otherRiskFlags = Object.entries(trends.riskFlagCounts)
            .filter(([flag]) => !criticalFlags.includes(flag))
            .sort((a, b) => b[1] - a[1]); // Sort by frequency
        
        if (otherRiskFlags.length > 0) {
            const topFlags = otherRiskFlags.slice(0, 2).map(([flag, count]) => 
                `${flag} (${count}x)`
            ).join(', ');
            factors.push(`Risk patterns: ${topFlags}`);
        }
        
        // Clamp score between 0 and 100
        score = Math.max(0, Math.min(100, Math.round(score)));
        
        // Determine trend direction
        let trendDirection = trends.trendDirection;
        
        // Add trend to factors if significant
        if (trendDirection === 'improving') {
            factors.push('📈 Mood trending upward over time');
        } else if (trendDirection === 'declining') {
            factors.push('📉 Mood trending downward over time');
        }
        
        // If no specific factors found, add general one
        if (factors.length === 0) {
            factors.push('Stable emotional patterns detected');
        }
        
        return {
            score,
            trend: trendDirection,
            confidence,
            factors,
            rawMetrics: {
                averageMoodScore: trends.averageMoodScore,
                averageSentiment: trends.averageSentiment,
                averageStress: trends.averageStress,
                averageEnergy: trends.averageEnergy,
                moodVolatility: trends.moodVolatility,
                negativeEmotionFrequency: trends.negativeEmotionFrequency,
                dataPoints: trends.dataPoints
            }
        };
        
    } catch (err) {
        console.error('Wellness score calculation error:', err);
        throw err;
    }
}

module.exports = { calculateWellnessScore };
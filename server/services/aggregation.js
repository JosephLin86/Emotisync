const Mood = require('../models/Mood');
const JournalAnalysis = require('../models/JournalAnalysis');

async function computeTrends(roomId, days = 30) {
    try {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);
        
        // Fetch mood data
        const moods = await Mood.find({
            roomId,
            createdAt: { $gte: dateLimit }
        }).sort({ createdAt: 1 });
        
        // Fetch journal analysis data
        const analyses = await JournalAnalysis.find({
            roomId,
            createdAt: { $gte: dateLimit }
        }).sort({ createdAt: 1 });
        
        // Compute metrics
        const averageMoodScore = moods.length > 0
            ? moods.reduce((sum, m) => sum + m.moodScore, 0) / moods.length
            : null;
        
        const averageSentiment = analyses.length > 0
            ? analyses.reduce((sum, a) => sum + a.sentiment, 0) / analyses.length
            : null;
        
        const averageStress = moods.length > 0
            ? moods.reduce((sum, m) => sum + m.stressLevel, 0) / moods.length
            : null;
        
        const averageEnergy = moods.length > 0
            ? moods.reduce((sum, m) => sum + m.energyLevel, 0) / moods.length
            : null;
        
        // Emotional volatility (variance in mood scores)
        let moodVolatility = 0;
        if (moods.length > 1) {
            const variance = moods.reduce((sum, m) => {
                return sum + Math.pow(m.moodScore - averageMoodScore, 2);
            }, 0) / moods.length;
            moodVolatility = Math.sqrt(variance);
        }
        
        // Negative emotion frequency
        const allEmotions = analyses.flatMap(a => a.emotions);
        const negativeEmotions = ['anxiety', 'stress', 'sadness', 'anger', 'fear'];
        const negativeCount = allEmotions.filter(e => 
            negativeEmotions.includes(e.toLowerCase())
        ).length;
        const negativeEmotionFrequency = allEmotions.length > 0
            ? negativeCount / allEmotions.length
            : 0;
        
        // Risk flag frequency
        const allRiskFlags = analyses.flatMap(a => a.riskFlags);
        const riskFlagCounts = {};
        allRiskFlags.forEach(flag => {
            riskFlagCounts[flag] = (riskFlagCounts[flag] || 0) + 1;
        });
        
        // Trend direction (compare first half vs second half)
        let trendDirection = 'stable';
        if (moods.length >= 4) {
            const midpoint = Math.floor(moods.length / 2);
            const firstHalf = moods.slice(0, midpoint);
            const secondHalf = moods.slice(midpoint);
            
            const firstAvg = firstHalf.reduce((sum, m) => sum + m.moodScore, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((sum, m) => sum + m.moodScore, 0) / secondHalf.length;
            
            const change = secondAvg - firstAvg;
            if (change > 1) trendDirection = 'improving';
            else if (change < -1) trendDirection = 'declining';
        }
        
        return {
            averageMoodScore,
            averageSentiment,
            averageStress,
            averageEnergy,
            moodVolatility,
            negativeEmotionFrequency,
            riskFlagCounts,
            trendDirection,
            dataPoints: {
                moodEntries: moods.length,
                journalAnalyses: analyses.length
            }
        };
        
    } catch (err) {
        console.error('Aggregation error:', err);
        throw err;
    }
}

module.exports = { computeTrends };
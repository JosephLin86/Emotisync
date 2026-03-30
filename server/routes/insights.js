const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const JournalAnalysis = require('../models/JournalAnalysis');
const Mood = require('../models/Mood');
const verifyToken = require('../middleware/verifyToken');
const { calculateWellnessScore } = require('../services/wellnessScore');

router.get('/:roomId/insights', verifyToken, async (req, res) => {
    try {
        const { roomId } = req.params;
        const { days = 30 } = req.query;
        
        // Verify room exists and user has access
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        
        const isTherapist = room.therapistId.toString() === req.user.id;
        
        if (!isTherapist) {
            return res.status(403).json({ 
                message: 'Only therapists can access insights' 
            });
        }
        
        // Calculate date range
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - parseInt(days));
        
        // Check if there's any data
        const moodCount = await Mood.countDocuments({
            roomId,
            createdAt: { $gte: dateLimit }
        });
        
        const journalCount = await JournalAnalysis.countDocuments({
            roomId,
            createdAt: { $gte: dateLimit }
        });
        
        // NO DATA - Return empty state
        if (moodCount === 0 && journalCount === 0) {
            return res.json({
                wellnessScore: {
                    score: null,
                    trend: 'insufficient_data',
                    confidence: 'none',
                    factors: [],
                    message: 'No mood or journal data available yet'
                },
                emotionalPatterns: {
                    topEmotions: [],
                    totalEntries: 0
                },
                recentSummaries: [],
                moodTrend: {
                    history: [],
                    averages: null
                },
                riskAssessment: {
                    flags: {},
                    level: 'unknown'
                },
                periodCovered: {
                    days: parseInt(days),
                    from: dateLimit,
                    to: new Date()
                },
                isEmpty: true  // Flag for frontend
            });
        }
        
        // HAS DATA - Proceed with normal analysis
        // Get wellness score
        const wellnessScore = await calculateWellnessScore(roomId, days);
        
        // Get recent journal summaries
        const recentAnalyses = await JournalAnalysis.find({
            roomId,
            createdAt: { $gte: dateLimit }
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('summary sentiment emotions intensity riskFlags createdAt');
        
        // Get emotion frequency
        const allAnalyses = await JournalAnalysis.find({
            roomId,
            createdAt: { $gte: dateLimit }
        });
        
        const emotionCounts = {};
        allAnalyses.forEach(analysis => {
            analysis.emotions.forEach(emotion => {
                emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
            });
        });
        
        // Sort emotions by frequency
        const topEmotions = Object.entries(emotionCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([emotion, count]) => ({
                emotion,
                count,
                percentage: Math.round((count / allAnalyses.length) * 100)
            }));
        
        // Get mood trend data
        const moodHistory = await Mood.find({
            roomId,
            createdAt: { $gte: dateLimit }
        })
        .sort({ createdAt: 1 })
        .select('moodScore stressLevel energyLevel createdAt');
        
        // Compile insights response
        const insights = {
            wellnessScore: {
                score: wellnessScore.score,
                trend: wellnessScore.trend,
                confidence: wellnessScore.confidence,
                factors: wellnessScore.factors,
                message: getScoreMessage(wellnessScore.score, wellnessScore.trend)
            },
            emotionalPatterns: {
                topEmotions,
                totalEntries: allAnalyses.length
            },
            recentSummaries: recentAnalyses.map(a => ({
                summary: a.summary,
                sentiment: a.sentiment,
                emotions: a.emotions,
                intensity: a.intensity,
                riskFlags: a.riskFlags,
                date: a.createdAt
            })),
            moodTrend: {
                history: moodHistory,
                averages: wellnessScore.rawMetrics
            },
            riskAssessment: {
                flags: wellnessScore.rawMetrics?.riskFlagCounts || {},
                level: determineRiskLevel(wellnessScore.score, wellnessScore.rawMetrics?.riskFlagCounts)
            },
            periodCovered: {
                days: parseInt(days),
                from: dateLimit,
                to: new Date()
            },
            isEmpty: false
        };
        
        res.json(insights);
        
    } catch (err) {
        console.error('Insights fetch error:', err);
        res.status(500).json({ 
            message: 'Failed to fetch insights', 
            error: err.message 
        });
    }
});

// Helper functions remain the same...
function getScoreMessage(score, trend) {
    if (score === null) {
        return 'Insufficient data to generate wellness score';
    }
    
    let message = '';
    
    if (score >= 75) {
        message = 'Client shows strong positive indicators';
    } else if (score >= 60) {
        message = 'Client shows generally positive patterns';
    } else if (score >= 40) {
        message = 'Client shows mixed emotional patterns';
    } else if (score >= 25) {
        message = 'Client shows concerning patterns - increased support recommended';
    } else {
        message = 'Client shows significant distress indicators - immediate attention recommended';
    }
    
    if (trend === 'improving') {
        message += ' with improving trajectory';
    } else if (trend === 'declining') {
        message += ' with declining trajectory';
    }
    
    return message;
}

function determineRiskLevel(score, riskFlags) {
    const criticalFlags = ['self-harm-mention', 'severe-distress', 'suicidal-ideation'];
    const hasCritical = Object.keys(riskFlags || {}).some(flag => 
        criticalFlags.includes(flag)
    );
    
    if (hasCritical) return 'high';
    if (score !== null && score < 30) return 'high';
    if (score !== null && score < 50) return 'medium';
    return 'low';
}

module.exports = router;
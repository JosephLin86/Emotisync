export default function MoodTab({ roomId, userRole }) {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Mood Tracking
            </h2>
            <p className="text-gray-600 mb-8 text-center max-w-md">
                {userRole === 'therapist' 
                    ? "View your client's mood history and emotional patterns over time." 
                    : "Track your emotional state and see your mood patterns visualized."}
                {" "}This feature is coming soon!
            </p>
            <div className="flex gap-3">
                <div className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                    📊 Mood graphs
                </div>
                <div className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                    😊 Emotion tracking
                </div>
                <div className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                    📈 Trend analysis
                </div>
            </div>
        </div>
    );
}
//journalTab component
import { useState } from 'react';
import { addJournal, editJournal } from '../../services/roomService';

export default function JournalTab({ roomId, journalEntries, setJournalEntries, userRole}) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    // Edit form state
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!content.trim()) return;

        try{
            setSubmitting(true);
            const newEntry = await addJournal(roomId, title, content);

            //add new entry to the beginning
            setJournalEntries([newEntry, ...journalEntries]);

            //clear the form
            setTitle('');
            setContent('');
            setSubmitting(false);
        } catch(err){
            console.error('Failed to add Journal Entry:', err);
            alert('Failed to add entry, please try again');
            setSubmitting(false);
        }
    }

    const openEditModal = (entry) => {
        setEditingId(entry._id);
        setEditTitle(entry.title);
        setEditContent(entry.content);
    };

    const closeEditModal = () => {
        setEditingId(null);
        setEditTitle('');
        setEditContent('');
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editContent.trim()) return;

        try {
            setSubmitting(true);
            const updatedEntry = await editJournal(roomId, editingId, editTitle, editContent);

            setJournalEntries(journalEntries.map(entry => 
                entry._id === editingId ? updatedEntry : entry
            ));
            
            closeEditModal();
            setSubmitting(false);
            
        } catch (err) {
            console.error('Failed to edit entry:', err);
            alert('Failed to edit entry. Please try again.');
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Shared Journal</h2>
                <span className="text-sm text-gray-500">{journalEntries.length} entries</span>
            </div>

            {/* Only show form if user is a client */}
            {userRole === 'client' && (
                <form onSubmit={handleSubmit} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Entry
                    </label>
                    
                    {/* Title input */}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Entry title (optional)"
                        className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    
                    {/* Content textarea */}
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your thoughts here..."
                        rows="6"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                    
                    <div className="mt-4 flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                            {content.length} characters
                        </span>
                        <button
                            type="submit"
                            disabled={submitting || !content.trim()}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                        >
                            {submitting ? 'Saving...' : 'Add Entry'}
                        </button>
                    </div>
                </form>
            )}

            {/* Therapist view message */}
            {userRole === 'therapist' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-purple-700">
                    📖 You're viewing your client's journal. Only clients can create entries.
                </div>
            )}

            {/* Edit Modal */}
            {editingId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">Edit Journal Entry</h3>
                                <button
                                    onClick={closeEditModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit}>
                                <div className="space-y-4">
                                    {/* Edit Title */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            placeholder="Entry title"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Edit Content */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Content
                                        </label>
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            placeholder="Write your thoughts here..."
                                            rows="12"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                        />
                                    </div>

                                    <div className="flex justify-between items-center pt-4">
                                        <span className="text-xs text-gray-500">
                                            {editContent.length} characters
                                        </span>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={closeEditModal}
                                                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitting || !editContent.trim()}
                                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                                            >
                                                {submitting ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Journal Entries List */}
            <div className="space-y-4">
                {journalEntries.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-gray-600 font-medium mb-1">No journal entries yet</p>
                        <p className="text-gray-500 text-sm">
                            {userRole === 'client' ? 'Start writing to begin your therapeutic journey' : 'Your client hasn\'t written any entries yet'}
                        </p>
                    </div>
                ) : (
                    journalEntries.map((entry) => (
                        <div 
                            key={entry._id} 
                            className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                        >
                            {/* Entry Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        {entry.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            {entry.user?.username}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {new Date(entry.createdAt).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Edit button - only show to client who owns the entry */}
                                {userRole === 'client' && (
                                    <button
                                        onClick={() => openEditModal(entry)}
                                        className="text-gray-400 hover:text-indigo-600 transition-colors p-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Entry Content */}
                            <div className="prose prose-gray max-w-none">
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {entry.content}
                                </p>
                            </div>

                            {/* Entry Footer */}
                            {entry.updatedAt !== entry.createdAt && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <span className="text-xs text-gray-500 italic">
                                        Last edited {new Date(entry.updatedAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
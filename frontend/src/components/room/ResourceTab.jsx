import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ResourceTab({ roomId, userRole }) {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');

    // Fetch files on component mount
    useEffect(() => {
        fetchFiles();
    }, [roomId]);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/room/${roomId}/resources`);
            setFiles(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch resources:', err);
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            setUploadError('File size must be less than 10MB');
            return;
        }

        try {
            setUploading(true);
            setUploadError('');

            // Create FormData
            const formData = new FormData();
            formData.append('file', file);
            
            // Upload to backend
            const response = await api.post(`/api/room/${roomId}/resources`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            // Add to state
            setFiles([response.data, ...files]);
            setUploading(false);
            
            // Clear file input
            e.target.value = '';
        } catch (err) {
            setUploadError(err.response?.data?.message || 'Failed to upload file');
            setUploading(false);
        }
    };

    const handleDownload = async (resourceId) => {
        try {
            const response = await api.get(`/api/room/${roomId}/resources/${resourceId}/download`);
            window.open(response.data.url, '_blank');
        } catch (err) {
            alert('Failed to download file');
        }
    };

    const handleDelete = async (fileId) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;

        try {
            await api.delete(`/api/room/${roomId}/resources/${fileId}`);
            setFiles(files.filter(f => f._id !== fileId));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete file');
        }
    };

    const startEditing = (file) => {
        setEditingId(file._id);
        setEditingName(file.name);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingName('');
    };

    const saveEdit = async (fileId) => {
        if (!editingName.trim()) {
            alert('File name cannot be empty');
            return;
        }

        try {
            const response = await api.patch(`/api/room/${roomId}/resources/${fileId}`, {
                name: editingName.trim()
            });

            // Update the file in state
            setFiles(files.map(f => f._id === fileId ? response.data : f));
            
            // Clear editing state
            setEditingId(null);
            setEditingName('');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update file name');
        }
    };

    // Check if user can delete this file
    const canDeleteFile = (file) => {
        // Therapist can delete any file
        if (userRole === 'therapist') return true;
        
        // Client can only delete their own files
        if (userRole === 'client' && file.uploadedBy?.role === 'client') return true;
        
        return false;
    };

    // Check if user can edit this file name
    const canEditFile = (file) => {
        // Same logic as delete - therapist can edit any, client can edit their own
        if (userRole === 'therapist') return true;
        if (userRole === 'client' && file.uploadedBy?.role === 'client') return true;
        return false;
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (type) => {
        if (type.includes('pdf')) {
            return (
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            );
        }
        if (type.includes('image')) {
            return (
                <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            );
        }
        return (
            <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        );
    };

    // Get badge color based on uploader role
    const getRoleBadge = (role) => {
        if (role === 'therapist') {
            return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">Therapist</span>;
        }
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">Client</span>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Shared Resources</h2>
                    <p className="text-gray-600 mt-1">
                        {userRole === 'therapist' 
                            ? 'Upload worksheets, exercises, and resources for your client'
                            : 'Access materials shared by your therapist'}
                    </p>
                </div>
                
                {/* Upload Button */}
                <div>
                    <label className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium inline-flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-xl">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        {uploading ? 'Uploading...' : 'Upload File'}
                        <input
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                    </label>
                </div>
            </div>

            {/* Upload Error */}
            {uploadError && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700 text-sm">{uploadError}</span>
                </div>
            )}

            {/* Upload Info */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-purple-700">
                        <p className="font-semibold mb-1">Supported file types:</p>
                        <p>PDF, JPG, PNG, DOC, DOCX • Maximum file size: 10MB</p>
                    </div>
                </div>
            </div>

            {/* Files List */}
            {files.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources yet</h3>
                    <p className="text-gray-600">
                        {userRole === 'therapist' 
                            ? 'Upload your first resource to share with your client'
                            : 'Your therapist will share resources here'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {files.map((file) => (
                        <div
                            key={file._id}
                            className="flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all"
                        >
                            {/* File Icon */}
                            <div className="flex-shrink-0">
                                {getFileIcon(file.type)}
                            </div>

                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                                {/* File Name - Editable */}
                                {editingId === file._id ? (
                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') saveEdit(file._id);
                                                if (e.key === 'Escape') cancelEditing();
                                            }}
                                            className="flex-1 px-3 py-1.5 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg font-semibold"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => saveEdit(file._id)}
                                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium cursor-pointer"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={cancelEditing}
                                            className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                                            {file.name}
                                        </h3>
                                        {canEditFile(file) && (
                                            <button
                                                onClick={() => startEditing(file)}
                                                className="p-1 text-gray-400 hover:text-purple-600 transition-colors cursor-pointer"
                                                title="Edit file name"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        {file.uploadedBy?.username || 'Unknown'}
                                        {file.uploadedBy?.role && (
                                            <span className="ml-1">{getRoleBadge(file.uploadedBy.role)}</span>
                                        )}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {new Date(file.uploadedAt).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                        {formatFileSize(file.size)}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleDownload(file._id)}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium inline-flex items-center gap-2 cursor-pointer"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download
                                </button>
                                
                                {canDeleteFile(file) && (
                                    <button
                                        onClick={() => handleDelete(file._id)}
                                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium cursor-pointer"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
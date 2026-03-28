const express = require('express');
const router = express.Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const Resource = require('../models/Resource');
const Room = require('../models/Room');
const verifyToken = require('../middleware/verifyToken');

// Configure AWS S3
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Configure multer with S3 storage
const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            // Generate unique filename
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const filename = `${req.params.roomId}/${uniqueSuffix}-${file.originalname}`;
            cb(null, filename);
        }
    }),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, JPG, PNG, and DOC files are allowed.'));
        }
    }
});

// Upload a resource
router.post('/:roomId/resources', verifyToken, upload.single('file'), async (req, res) => {
    try {
        const { roomId } = req.params;
        
        // Verify room exists and user has access
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        
        // Check if user is part of the room
        const isTherapist = room.therapistId.toString() === req.user.id;
        const isClient = room.clientId.toString() === req.user.id;
        
        if (!isTherapist && !isClient) {
            return res.status(403).json({ message: 'You do not have access to this room' });
        }
        
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        // Create resource document
        const resource = new Resource({
            name: req.file.originalname,
            s3Key: req.file.key, // S3 object key for deletion/download
            roomId: roomId,
            uploadedBy: req.user.id,
            size: req.file.size,
            type: req.file.mimetype
        });
        
        await resource.save();
        
        // Populate uploader info for response
        await resource.populate('uploadedBy', 'username role');
        
        res.status(201).json(resource);
        
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ message: 'Failed to upload file', error: err.message });
    }
});

// Get all resources for a room
router.get('/:roomId/resources', verifyToken, async (req, res) => {
    try {
        const { roomId } = req.params;
        
        // Verify room exists and user has access
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        
        const isTherapist = room.therapistId.toString() === req.user.id;
        const isClient = room.clientId.toString() === req.user.id;
        
        if (!isTherapist && !isClient) {
            return res.status(403).json({ message: 'You do not have access to this room' });
        }
        
        // Fetch resources
        const resources = await Resource.find({ roomId })
            .populate('uploadedBy', 'username role')
            .sort({ uploadedAt: -1 }); // Newest first
        
        res.json(resources);
        
    } catch (err) {
        console.error('Fetch resources error:', err);
        res.status(500).json({ message: 'Failed to fetch resources', error: err.message });
    }
});

// Get download URL for a resource (generates signed URL)
router.get('/:roomId/resources/:resourceId/download', verifyToken, async (req, res) => {
    try {
        const { roomId, resourceId } = req.params;
        
        // Verify room access
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        
        const isTherapist = room.therapistId.toString() === req.user.id;
        const isClient = room.clientId.toString() === req.user.id;
        
        if (!isTherapist && !isClient) {
            return res.status(403).json({ message: 'You do not have access to this room' });
        }
        
        // Find resource
        const resource = await Resource.findById(resourceId);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        
        // Generate signed URL (valid for 1 hour)
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: resource.s3Key
        });
        
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        
        res.json({ url: signedUrl });
        
    } catch (err) {
        console.error('Download URL error:', err);
        res.status(500).json({ message: 'Failed to generate download URL', error: err.message });
    }
});

// Delete a resource (therapist only)
router.delete('/:roomId/resources/:resourceId', verifyToken, async (req, res) => {
    try {
        const { roomId, resourceId } = req.params;
        
        // Verify room exists and user is therapist
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        
        if (room.therapistId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only therapists can delete resources' });
        }
        
        // Find resource
        const resource = await Resource.findById(resourceId);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        
        // Delete from S3
        const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: resource.s3Key
        });
        
        await s3Client.send(deleteCommand);
        
        // Delete from database
        await Resource.findByIdAndDelete(resourceId);
        
        res.json({ message: 'Resource deleted successfully' });
        
    } catch (err) {
        console.error('Delete resource error:', err);
        res.status(500).json({ message: 'Failed to delete resource', error: err.message });
    }
});

module.exports = router;
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const auditSchema = new mongoose.Schema({
    _id: { 
        type: String, 
        default: () => `aud_${uuidv4().replace(/-/g, '')}` 
    },
    userId: {
        type: String,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    module: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.Mixed
    },
    status: { 
        type: String, 
        enum: ['success', 'failed'], 
        default: 'success' 
    },
}, { timestamps: true });

auditSchema.index({ userId: 1 });
auditSchema.index({ action: 1 });
auditSchema.index({ createdAt: -1 });
auditSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Audit', auditSchema);
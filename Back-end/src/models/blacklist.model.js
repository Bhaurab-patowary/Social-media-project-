const mongoose = require('mongoose');

const blackListTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

blackListTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const tokenBlacklistModel = mongoose.model('blacklistTokens', blackListTokenSchema);

module.exports = tokenBlacklistModel;
const mongoose = require('mongoose');

const PortfolioDownloadSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName:     { type: String, default: '' },
  userEmail:    { type: String, default: '' },
  zipPath:      { type: String, required: true },
  fileName:     { type: String, default: '' },
  fileSize:     { type: Number, default: 0 },
  downloadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PortfolioDownload', PortfolioDownloadSchema);

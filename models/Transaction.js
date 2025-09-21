const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  referenceId: String,
  accountNumber: String,
  beneName: String,
  amount: Number,
  status: String,
  mode: String,
  payoutPartner: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);

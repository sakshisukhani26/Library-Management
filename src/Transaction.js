const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  issue_date: Date,
  return_date: Date,
  rent_amount: Number
}, { collection: 'Transaction' });

module.exports = mongoose.model('Transaction', TransactionSchema);

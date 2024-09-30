const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  book_name: String,
  category: String,
  rent_per_day: Number
}, { collection: 'Book' });

module.exports = mongoose.model('Book', BookSchema);

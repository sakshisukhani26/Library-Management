const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  user_name: String,
  email: String,
  password: String,
  rented_books: [
    {
      book_id: mongoose.Schema.Types.ObjectId,
      rent_date: Date,
      return_date: Date,
    }
  ]
}, { collection: 'User' });

module.exports = mongoose.model('User', UserSchema);

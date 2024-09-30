require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());


const User = require('./User');
const Book = require('./Book');
const Transaction = require('./Transaction');
const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/';
// Connect to MongoDB Atlas
mongoose.connect(uri, {
  dbName:"Library",
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch(err => {
  console.error('Connection error', err);
});
// Define Mongoose Schemas
app.get('/', (req, res) => {
  res.send('Hello, MongoDB is connected!');
});

// API Endpoints

// 1. Get books by name or term in the name
app.get('/api/books/search', async (req, res) => {
  const { term } = req.query;
  try {
    const books = await Book.find({ book_name: new RegExp(term, 'i') });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Get books by rent price range
app.get('/api/books/rent-range', async (req, res) => {
  const { min, max } = req.query;
  try {
    const books = await Book.find({ rent_per_day: { $gte: parseInt(min), $lte: parseInt(max) } });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 3. Get books by category, name/term, and rent per day range
app.get('/api/books/filter', async (req, res) => {
  const { category, term, min, max } = req.query;
  try {
    const books = await Book.find({
      category: category,
      book_name: new RegExp(term, 'i'),
      rent_per_day: { $gte: parseInt(min), $lte: parseInt(max) }
    });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Issue a book (create a new transaction)
app.post('/api/transactions/issue', async (req, res) => {
  const { username, bookname, issueDate } = req.body;
  try {
    const user = await User.findOne({ user_name: username });
    const book = await Book.findOne({ book_name: bookname });
    if (!user || !book) return res.status(404).json({ message: 'User or book not found' });

    const transaction = new Transaction({
      user_id: user._id,
      book_id: book._id,
      issue_date: new Date(issueDate)
    });
    await transaction.save();
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Return a book (update the transaction)
app.post('/api/transactions/return', async (req, res) => {
  const { book_name, user_name, return_date } = req.body;
  try {
    const user = await User.findOne({ user_name });
    const book = await Book.findOne({ book_name });

    if (!user || !book) return res.status(404).json({ message: 'User or Book not found' });

    const transaction = await Transaction.findOne({
      user_id: user._id,
      book_id: book._id,
      return_date: null
    });

    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    const returnDate = new Date(return_date);
    const rentDays = Math.ceil((returnDate - transaction.issue_date) / (1000 * 60 * 60 * 24));
    const rentAmount = rentDays * book.rent_per_day;

    transaction.return_date = returnDate;
    transaction.rent_amount = rentAmount;

    await transaction.save();
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/transactions/book-status', async (req, res) => {
  const { bookName } = req.query;
  try {
    // Get the book ID using the book name
    const book = await Book.findOne({ book_name: new RegExp(bookName, 'i') });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const transactions = await Transaction.find({ book_id: book._id }).populate('user_id', 'user_name email');
    const issuedCount = transactions.length;

    // Find the currently issued book (if any)
    const currentlyIssued = await Transaction.findOne({ book_id: book._id, return_date: null }).populate('user_id', 'user_name email');

    const status = currentlyIssued
      ? { currently_issued_to: currentlyIssued.user_id, status: 'Currently Issued' }
      : { status: 'Not Issued at the Moment' };

    res.json({
      total_issued_count: issuedCount,
      current_status: status
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.get('/api/transactions/book-rent', async (req, res) => {
    const { bookName } = req.query;
    try {
      // Get the book ID using the book name
      const book = await Book.findOne({ book_name: new RegExp(bookName, 'i') });
      if (!book) return res.status(404).json({ message: 'Book not found' });
  
      const transactions = await Transaction.find({ book_id: book._id });
      const totalRent = transactions.reduce((sum, transaction) => sum + (transaction.total_rent || 0), 0);
  
      res.json({ book_name: book.book_name, total_rent_generated: totalRent });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app.get('/api/transactions/user-books', async (req, res) => {
    const { user_name } = req.query;
    try {
      const user = await User.findOne({ user_name });
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      const transactions = await Transaction.find({ user_id: user._id }).populate('book_id', 'book_name');
      res.json(transactions.map(t => t.book_id.book_name));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  app.get('/api/transactions/date-range', async (req, res) => {
    const { start_date, end_date } = req.query;
    try {
      const transactions = await Transaction.find({
        issue_date: { $gte: new Date(start_date), $lte: new Date(end_date) }
      }).populate('book_id user_id', 'book_name user_name');
  
      res.json(transactions.map(t => ({
        book_name: t.book_id.book_name,
        user_name: t.user_id.user_name
      })));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  app.get('/api/users', async (req, res) => {
    try {
      const users = await User.find();
      console.log(users);
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  app.get('/api/books', async (req, res) => {
    try {
      const books = await Book.find();
      res.json(books);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
          
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

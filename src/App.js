// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState('');

  const baseURL = 'http://localhost:3000/api';

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${baseURL}/users`);
      setUsers(response.data);
    } catch (error) {
      setMessage('Error fetching users');
    }
  };

  // Fetch Books
  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${baseURL}/books`);
      setBooks(response.data);
    } catch (error) {
      setMessage('Error fetching books');
    }
  };

  // Issue Book
  const issueBook = async (userName, bookName, issueDate) => {
    try {
      const response = await axios.post(`${baseURL}/transactions/issue`, {
        username: userName,
        bookname: bookName,
        issueDate,
      });
      setMessage('Book issued successfully!');
      console.log(response.data);
    } catch (error) {
      setMessage('Error issuing book');
    }
  };

  // Return Book
  const returnBook = async (userName, bookName, returnDate) => {
    try {
      const response = await axios.post(`${baseURL}/transactions/return`, {
        user_name: userName,
        book_name: bookName,
        return_date: returnDate,
      });
      setMessage('Book returned successfully!');
      console.log(response.data);
    } catch (error) {
      setMessage('Error returning book');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchBooks();
  }, []);

  return (
    <div className="container">
      <h1>Library Management Dashboard</h1>

      <section>
        <h2>Users</h2>
        <button onClick={fetchUsers}>Refresh Users</button>
        <ul>
          {users.map((user) => (
            <li key={user._id}>{user.user_name} - {user.email}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Books</h2>
        <button onClick={fetchBooks}>Refresh Books</button>
        <ul>
          {books.map((book) => (
            <li key={book._id}>{book.book_name} - ${book.rent_per_day}/day</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Issue Book</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            issueBook(e.target.username.value, e.target.bookname.value, e.target.issueDate.value);
          }}
        >
          <input type="text" name="username" placeholder="Username" required />
          <input type="text" name="bookname" placeholder="Book Name" required />
          <input type="date" name="issueDate" required />
          <button type="submit">Issue Book</button>
        </form>
      </section>

      <section>
        <h2>Return Book</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            returnBook(e.target.username.value, e.target.bookname.value, e.target.returnDate.value);
          }}
        >
          <input type="text" name="username" placeholder="Username" required />
          <input type="text" name="bookname" placeholder="Book Name" required />
          <input type="date" name="returnDate" required />
          <button type="submit">Return Book</button>
        </form>
      </section>
    </div>
  );
};

export default App;

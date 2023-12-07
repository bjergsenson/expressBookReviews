const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


const normalizeString = (str) => str.toLowerCase().replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, '').trim();

public_users.post("/register", (req, res) => {

});


// Get the book list available in the shop
public_users.get('/', function (req, res) {
  //Checks if there are any books
  try {
    if (!books || books.length === 0) {
      return res.status(404).json({ message: "No books found" });
    }
    // Retrieve all books
    res.status(200).json(books);
  } catch (error) {
    console.error("Error retrieving books:", error);
    res.status(500).json({ message: "Internal server error" });
  };
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  try {
    const requestedISBN = req.params.isbn;

    // Using Object.values to get an array of books and filter the book by ISBN
    const matchingBooks = Object.values(books).filter(book => book.isbn === requestedISBN);

    if (matchingBooks.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Assuming there's only one book with a given ISBN, use the first item in the filtered array
    const book = matchingBooks[0];

    res.status(200).json(book);
  } catch (error) {
    console.error("Error retrieving book by ISBN:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Get book details based on author
public_users.get('/author/:author', function (req, res) {

  try {
    const requestedAuthor = normalizeString(req.params.author);

    // Using Object.values to get an array of books and filter the books by author
    const matchingBooks = Object.values(books).filter(book => {
      const authorName = normalizeString(book.author);
      return authorName.includes(requestedAuthor);
    });

    if (matchingBooks.length === 0) {
      return res.status(404).json({ message: "No books found for the given author" });
    }

    res.status(200).json(matchingBooks);
  } catch (error) {
    console.error("Error retrieving books by author:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  try {
    const requestedTitle = normalizeString(req.params.title);

    // Using Object.values to get an array of books and filter the books by title
    const matchingBooks = Object.values(books).filter(book => {
      const bookTitle = normalizeString(book.title);
      return bookTitle.includes(requestedTitle);
    });

    if (matchingBooks.length === 0) {
      return res.status(404).json({ message: "No books found for the given title" });
    }

    res.status(200).json(matchingBooks);
  } catch (error) {
    console.error("Error retrieving books by title:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  try {
    const requestedISBN = req.params.isbn;
    const matchingBooks = Object.values(books).filter(book => book.isbn === requestedISBN);

    // Check if the requested ISBN exists in the books database
    if (matchingBooks.length === 0) {
      return res.status(404).json({ message: "No book found for the given ISBN" });
    }

    // Retrieve reviews for the specified book by ISBN
    const bookReviews = matchingBooks[0] || {};
    console.log(bookReviews.reviews)

    if (Object.keys(bookReviews).length === 0) {
      return res.status(404).json({ message: "No reviews found for the given ISBN" });
    }

    res.status(200).json(bookReviews.reviews);
  } catch (error) {
    console.error("Error retrieving reviews by ISBN:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports.general = public_users;

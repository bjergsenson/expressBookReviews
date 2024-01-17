const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();


// Sample user data with reviews
let users = [{
  "john123": {
    username: "john123",
    reviews: {
      "0385474547": { rating: 4, comment: "Great book!" },
      "0517092913": { rating: 3, comment: "Interesting fairy tales." },
    }
  },
  "jane456": {
    username: "jane456",
    reviews: {
      "0385474547": { rating: 5, comment: "Amazing!" },
    }
  }
}];


const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}


const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password)
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

regd_users.get("/auth/session", (req, res) => {
  console.log(req.session.authorization);  // Log the session data to the console
  return res.status(200).send("Session data: " + JSON.stringify(req.session));
});



//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    console.log("Setting up session during login:", req.session)
    req.session.authorization = {
      accessToken, username
    }
    req.session.user = { accessToken, username };
    console.log(req.session.authorization)
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});


regd_users.put("/auth/review/:isbn", (req, res) => {
  try {
    console.log("Entered /auth/review endpoint");
    console.log(req.session.user)

    // Check if user is logged in
    if (!req.session.user || !req.session.user.username) {
      console.error("User not authenticated");
      return res.status(403).json({ message: "User not authenticated" });
    }

    const username = req.session.user.username;
    const isbn = req.params.isbn;
    const rating = req.query.rating;
    const comment = req.query.comment;

    console.log("Received data - Username:", username, "ISBN:", isbn, "Rating:", rating, "Comment:", comment);

    // Check if the ISBN is valid
    if (!isbn) {
      console.error("Invalid ISBN:", isbn);
      return res.status(400).json({ message: "Invalid ISBN" });
    }

    // Check if the rating is valid
    if (!rating || isNaN(parseInt(rating)) || parseInt(rating) < 1 || parseInt(rating) > 5) {
      console.error("Invalid rating:", rating);
      return res.status(400).json({ message: "Invalid rating" });
    }

    // Find or create the user in the users object
    if (!users[username]) {
      users[username] = { username: username, reviews: {} };
    }

    // Update or add the review for the given ISBN
    users[username].reviews[isbn] = { rating: parseInt(rating), comment: comment };

    console.log("Review added/updated successfully");
    return res.status(200).json({ message: "Review added/updated successfully" });
  } catch (error) {
    console.error("Error adding/updating review:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const users = require('./router/auth_users.js').users;
const isValid = require('./router/auth_users.js').isValid;

const app = express();

app.use(express.json());
app.use(session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }))

app.use("/customer/auth/*", function auth(req, res, next) {
    console.log("Entering auth middleware");
    console.log("Session data:", req.session.authorization['username']);

    if (req.session && req.session.authorization) {
        const token = req.session.authorization['accessToken'];

        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.session.user = user;  // Set the user in the session
                next();
            } else {
                console.error("JWT Verification Error:", err);
                return res.status(403).json({ message: "User not authenticated during middleware" });
            }
        });
    } else {
        console.error("No session authorization found");
        return res.status(403).json({ message: "User not logged in" });
    }
});

app.use("/customer", customer_routes);
app.use("/", genl_routes);


app.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password });
            console.log(users)
            return res.status(200).json({ message: "User successfully registred. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user." });
});


const PORT = 3333;
app.listen(PORT, () => console.log("Server is running"));

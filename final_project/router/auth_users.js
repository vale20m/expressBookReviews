const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    {
	"username": "Valentin",
    "password": "123"
    }
];

const isValid = (username)=>{ //returns boolean
    const userExists = users.filter((user) => user.username == username);
    if (userExists[0] != undefined) {
        return false;
    }
    return true;
}

const authenticatedUser = (username,password)=>{ //returns boolean
    const user = users.filter((user) => user.username == username);
    if (user[0] != undefined && user[0].password == password){
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username == '' || password == '') {
        return res.status(400).json({message: "You must include a username and a password to be able to log in"});
    }
    if (authenticatedUser(username,password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = {
            accessToken,username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(400).json({message: "Invalid username or password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    if (req.body.review == undefined){
        return res.status(400).json({message: "You have to establish a review on the body"});
    }
    const book = books[req.params.isbn];
    const review = req.body.review;
    const username = req.session.authorization.username;
    if (book != undefined){
        books[req.params.isbn].reviews[username] = review;
        return res.status(200).json({message: "Review uploaded successfully!"});
    } else {
        return res.status(400).json({message: "Book not found"});
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const book = books[req.params.isbn];
    if (book != undefined){
        const username = req.session.authorization.username;
        if (books[req.params.isbn].reviews[username] == undefined){
            return res.status(200).json({message: "You haven't made any reviews about this book yet"});
        }
        delete books[req.params.isbn].reviews[username];
        return res.status(200).json({message: "Review deleted successfully!"});
    } else {
        return res.status(200).json({message: "Book not found"});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

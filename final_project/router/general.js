const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.get("/register", (req,res) => {
    res.send(JSON.stringify(users));
});

public_users.post("/register", (req,res) => {
    if (req.body.username == "" || req.body.username == undefined || req.body.password == "" || req.body.password == undefined){
        return res.status(400).json({message: "You must enter a username and a password"});
    }
    if (isValid(req.body.username)){
        const user = {
            "username": req.body.username,
            "password": req.body.password
        };
        users.push(user);
        return res.status(200).json({message: "User created successfully!"});
    }
    return res.status(400).json({message: "That username is already in"});
});


const getAllBooks = () => {
    return books;
  };

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    
    try {
        const allBooks = await getAllBooks();
        return res.status(200).send(JSON.stringify(allBooks, null, 4));
      } catch (e) {
        res.status(500).send(e);
    }
      
    //res.send(JSON.stringify(books));
  
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    
    const isbn = req.params.isbn;
    const booksBasedOnIsbn = (isbn) => {
        return new Promise((resolve,reject) =>{
          setTimeout(() =>{
            if (books[isbn] != undefined){
                resolve(books[isbn]);
            } else {
                reject(new Error("Book not found"));
            }},1000);
        });
    }
    booksBasedOnIsbn(isbn).then((book) =>{
        return res.status(200).send(JSON.stringify(book, null, 4));
    }).catch((err)=>{
        res.status(400).json({error:"Book not found"})
    });
    
    
    // const filtered_book = books[req.params.isbn];
    // res.send(JSON.stringify(filtered_book));

});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    
    const matchingBooks = Object.values(await books).filter(
        (book) => book.author.toLowerCase() === req.params.author.toLowerCase()
    );
    if (matchingBooks.length > 0) {
        return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    } else {
        return res.status(404).json({ message: "No books by that author." });
    }
    
    
    
    // const keysArray = Object.keys(books);
    // const count = keysArray.length;
    // let filtered_books = [];
    // for(let i = 1; i <= count; i++){
    //     if (books[i] != undefined && books[i].author.toLowerCase() == req.params.author.toLowerCase()){
    //         filtered_books.push(books[i]);
    //     }
    // }
    // res.send(JSON.stringify(filtered_books));
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {


    const matchingBooks = Object.values(await books).filter(
        (book) => book.title.toLowerCase() === req.params.title.toLowerCase()
    );
    if (matchingBooks.length > 0) {
        return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    } else {
        return res.status(404).json({ message: "No books with that title." });
    }


    // const keysArray = Object.keys(books);
    // const count = keysArray.length;
    // let filtered_books = [];
    // for(let i = 1; i <= count; i++){
    //     if (books[i] != undefined && books[i].title == req.params.title){
    //         filtered_books.push(books[i]);
    //     }
    // }
    // res.send(JSON.stringify(filtered_books));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const filtered_book = books[req.params.isbn];
    res.send(JSON.stringify(filtered_book.review));
});

module.exports.general = public_users;

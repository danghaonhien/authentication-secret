//jshint esversion:6

//Step 1: put dotevn to protect link express, mongoose, body parser
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");
const app = express();

console.log(process.env.API_KEY);

//Step 2: activate
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

//Step 4: connect mongoose
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

//Step 5: Create a model User
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

//5b: add secret from .env, use Fields to select field to encrypt

//5c
const User = new mongoose.model("User", userSchema);

//Step 3:connect routes
app.get("/", function (req, res) {
  res.render("home");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/register", function (req, res) {
  res.render("register");
});
//Step 6: When register new user
app.post("/register", function (req, res) {
  const newUser = new User({
    email: req.body.username,
    password: md5(req.body.password),
  });

  //Step 7: save new User and check if theres error during , then render secret
  newUser.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets"); // this will make /secret page only accessed after registered
    }
  });
});
//Step 8: Check Robo 3T for db

//Step 9: Access secret via Login page
app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = md5(req.body.password);
  //Step 10 : find in db to check if there is username and password, if so, check to see if there is any err or FoundUser, if err, log err, if FoundUser, find if password mathed, then render secrets

  User.findOne({ email: username }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("secrets");
        }
      }
    }
  });
});

app.listen(3000, function () {
  console.log("Server started on PORT 3000");
});

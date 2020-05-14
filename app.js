//jshint esversion:6

//Step 1: put dotevn to protect link express, mongoose, body parser
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
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

//Have to put SESSION right here
app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

//Initialize PASSPORT after SESSIOn
app.use(passport.initialize());
//Use passport to deal with session
app.use(passport.session());

//Step 4: connect mongoose
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });
mongoose.set("useCreateIndex", true);
//Step 5: Create a model User
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

//5b: Add plugin passportlocalmongoose, use to hash and salt pw and to save user to mongodb

userSchema.plugin(passportLocalMongoose);

//5c
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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
app.get("/secrets", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

//To logout use LOGOUT from PASSPORT
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});
//Step 6: When register new user
app.post("/register", function (req, res) {
  // register from passport-local npm
  User.register({ username: req.body.username }, req.body.password, function (
    err,
    user
  ) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
});
//Step 8: Check Robo 3T for db

//Step 9: Access secret page via Login page
app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  //LOGIN method from PASSPORT
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
});

app.listen(3000, function () {
  console.log("Server started on PORT 3000");
});

const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
require("./db/dbConnection");


const passport = require('./utils/passport');
const session = require('express-session');
const userRoute = require('./routes/userRoute');



const port = 8000;


// Session middleware
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// middleware
app.use(express.json());
app.use(cors());

// parse application/json
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// routes
app.use("/api/v1/auth", userRoute);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

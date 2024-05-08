const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
require("./db/dbConnection");
const { deleteUnverifiedUsers } = require('./middleware/auth.middleware');


const passport = require('./utils/passport');
const session = require('express-session');
const userRoute = require('./routes/user.route');
const doctorRoute = require('./routes/doctor.route');
const appointmentRoute = require('./routes/appointment.route');



const port = 8000;


// call deleteUnverifiedUsers function
// deleteUnverifiedUsers();//

app.use(deleteUnverifiedUsers);


// Session middleware
app.use(session({
  secret: 'mySecretKey',
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
app.use("/api/v1/doctor", doctorRoute);
app.use("/api/v1/appointment", appointmentRoute);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

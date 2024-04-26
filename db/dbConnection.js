const mongoose = require("mongoose");
require('dotenv').config();


// mongoose
//   .connect(
//     `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.pysnkyy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
//   )
//   .then(() => console.log("Connect db"))
//   .catch((error) => {
//     console.log("not connected", `mongoose error:${error}`);
//   });


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to the database!");
}
).catch((error) => {
  console.log("Cannot connect to the database!", error);
  process.exit();
});






const express = require("express");
const routes = require('./routes')
const connectDB = require("./lib/connect");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true,
}));

app.use('/api', routes);

app.listen(3000, () => {
  connectDB();
  console.log("Server is running on http://localhost:3000");
});

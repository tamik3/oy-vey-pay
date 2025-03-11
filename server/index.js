const express = require("express");
const routes = require('./routes')
const connectDB = require("./lib/connect");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173', 'https://oy-vey-pay-fzan.onrender.com'],
    credentials: true,
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', routes);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
  connectDB();
  console.log("Server is running on http://localhost:3000");
});

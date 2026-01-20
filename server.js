const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth.routes");
app.use("/api/v1/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Task Manager API Running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
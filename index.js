const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config');
connectDB(); // Connect to MongoDB

const app = express();

// ✅ Render ke liye process.env.PORT use karo
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const tableRoutes = require("./routes/tables");
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use("/api/tables", tableRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('✅ Server is running...');
});

// ✅ Render ke liye yeh change zaroori hai
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});

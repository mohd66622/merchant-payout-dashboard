// routes/tables.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// ✅ Get all collection names
router.get("/", async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const names = collections.map(c => c.name); 
    res.json(names);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

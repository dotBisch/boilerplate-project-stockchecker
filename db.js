const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    // Only attempt connection if DB environment variable exists
    if (!process.env.DB) {
      console.log('No DB environment variable found, skipping database connection');
      return;
    }

    await mongoose.connect(process.env.DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

module.exports = { connectDB, mongoose };
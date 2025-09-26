const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    // Check for database connection string in multiple environment variables
    const connectionString = process.env.DB || process.env.MONGO_URL || process.env.MONGODB_URI;
    
    if (!connectionString) {
      console.log('No database environment variable found (DB, MONGO_URL, or MONGODB_URI), skipping database connection');
      return;
    }

    await mongoose.connect(connectionString, {
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
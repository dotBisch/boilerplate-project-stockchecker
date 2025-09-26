const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('Database already connected, skipping connection attempt');
    return;
  }

  try {
    // Check for database connection string in multiple environment variables
    const connectionString = process.env.DB || process.env.MONGO_URL || process.env.MONGODB_URI;
    
    console.log('Environment variables check:');
    console.log('- DB:', process.env.DB ? 'Set' : 'Not set');
    console.log('- MONGO_URL:', process.env.MONGO_URL ? 'Set' : 'Not set');
    console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    if (!connectionString) {
      console.log('❌ No database environment variable found (DB, MONGO_URL, or MONGODB_URI), skipping database connection');
      return;
    }

    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('Connection string (password hidden):', connectionString.replace(/:([^@]+)@/, ':****@'));

    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    isConnected = true;
    console.log('✅ Successfully connected to MongoDB!');
    console.log('Database name:', mongoose.connection.name);
    console.log('Connection state:', mongoose.connection.readyState);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    if (error.message.includes('ETIMEOUT')) {
      console.error('🌐 This appears to be a network/DNS timeout issue');
      console.error('💡 This often works fine on Railway but fails locally due to network restrictions');
    }
    // Don't throw error - let app continue without database for now
    console.log('⚠️  Continuing without database connection...');
  }
};

module.exports = { connectDB, mongoose };
// MongoDB Connection Test Script
require('dotenv').config();
const mongoose = require('mongoose');

// Your MongoDB connection string
const connectionString = 'mongodb+srv://franzivandevilla_db_user:1ZxS2dbY5uiCzB8K@stockchecker.wvw6uy7.mongodb.net/stockchecker?retryWrites=true&w=majority';

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string (password hidden):', connectionString.replace(/:([^@]+)@/, ':****@'));
    
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test basic operations
    const testCollection = mongoose.connection.db.collection('test');
    const insertResult = await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
    console.log('✅ Test document inserted:', insertResult.insertedId);
    
    const findResult = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log('✅ Test document retrieved:', findResult);
    
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ Test document cleaned up');
    
    console.log('🎉 MongoDB connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('🔑 Authentication Error: Please check your username and password');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('🌐 Network Error: Please check your internet connection and cluster URL');
    } else if (error.message.includes('IP')) {
      console.error('🚫 IP Whitelist Error: Make sure your IP is whitelisted in MongoDB Atlas');
    }
    
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed.');
    process.exit();
  }
}

// Replace YOUR_PASSWORD with your actual password before running
if (connectionString.includes('YOUR_PASSWORD')) {
  console.log('❌ Please update the connection string with your actual password');
  console.log('Replace YOUR_PASSWORD in the connection string with your MongoDB password');
  process.exit(1);
}

testConnection();
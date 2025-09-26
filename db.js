// No database dependencies required for API-only mode

const connectDB = async () => {
  // API-only mode - no database required
  console.log('🚀 Running in API-only mode');
  console.log('📊 Stock prices will be fetched from external API');
  console.log('💾 Likes stored in memory (resets on restart)');
};

module.exports = { connectDB };
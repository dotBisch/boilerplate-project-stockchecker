// Simple in-memory database for testing purposes
let inMemoryDB = {
  likes: {}
};

async function connectToDatabase() {
  // Return a mock database object for testing
  return {
    collection: (name) => {
      if (name === 'likes') {
        return {
          findOne: async (query) => {
            const stock = query.stock;
            if (query.likes) {
              // Check if IP has liked this stock
              const stockLikes = inMemoryDB.likes[stock] || [];
              return stockLikes.includes(query.likes) ? { stock, likes: stockLikes } : null;
            }
            // Get all likes for stock
            const likes = inMemoryDB.likes[stock] || [];
            return likes.length > 0 ? { stock, likes } : null;
          },
          updateOne: async (filter, update, options) => {
            const stock = filter.stock;
            if (!inMemoryDB.likes[stock]) {
              inMemoryDB.likes[stock] = [];
            }
            if (update.$addToSet && update.$addToSet.likes) {
              const ip = update.$addToSet.likes;
              if (!inMemoryDB.likes[stock].includes(ip)) {
                inMemoryDB.likes[stock].push(ip);
              }
            }
            return { acknowledged: true };
          }
        };
      }
      return {};
    }
  };
}

module.exports = { connectToDatabase };
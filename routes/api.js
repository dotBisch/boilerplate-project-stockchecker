'use strict';

const https = require('https');
const { connectToDatabase } = require('../database');
const { anonymizeIP } = require('../utils');

async function fetchStockPrice(stock) {
  return new Promise((resolve, reject) => {
    const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;
    
    https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const stockData = JSON.parse(data);
          resolve({
            stock: stockData.symbol,
            price: stockData.latestPrice
          });
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function getLikes(db, stock) {
  try {
    const result = await db.collection('likes').findOne({ stock: stock.toUpperCase() });
    return result ? result.likes.length : 0;
  } catch (error) {
    console.error('Error getting likes:', error);
    return 0;
  }
}

async function addLike(db, stock, anonymizedIP) {
  try {
    const stockUpper = stock.toUpperCase();
    
    // Check if this IP has already liked this stock
    const existing = await db.collection('likes').findOne({
      stock: stockUpper,
      likes: anonymizedIP
    });
    
    if (existing) {
      return false; // Already liked
    }
    
    // Add the like
    await db.collection('likes').updateOne(
      { stock: stockUpper },
      { $addToSet: { likes: anonymizedIP } },
      { upsert: true }
    );
    
    return true;
  } catch (error) {
    console.error('Error adding like:', error);
    return false;
  }
}

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res) {
      try {
        const { stock, like } = req.query;
        const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.ip || '127.0.0.1';
        const anonymizedIP = anonymizeIP(clientIP);
        
        const db = await connectToDatabase();
        
        if (!stock) {
          return res.json({ error: 'stock parameter required' });
        }
        
        // Handle single or multiple stocks
        const stocks = Array.isArray(stock) ? stock : [stock];
        
        if (stocks.length > 2) {
          return res.json({ error: 'maximum 2 stocks allowed' });
        }
        
        // Fetch stock prices
        const stockPromises = stocks.map(s => fetchStockPrice(s));
        const stockData = await Promise.all(stockPromises);
        
        // Handle likes if requested
        if (like === 'true') {
          for (const s of stocks) {
            await addLike(db, s, anonymizedIP);
          }
        }
        
        // Get likes for each stock
        const likesPromises = stocks.map(s => getLikes(db, s));
        const likesData = await Promise.all(likesPromises);
        
        // Format response
        if (stocks.length === 1) {
          // Single stock
          const result = {
            stockData: {
              stock: stockData[0].stock,
              price: stockData[0].price,
              likes: likesData[0]
            }
          };
          res.json(result);
        } else {
          // Multiple stocks - calculate relative likes
          const stock1Likes = likesData[0];
          const stock2Likes = likesData[1];
          
          const result = {
            stockData: [
              {
                stock: stockData[0].stock,
                price: stockData[0].price,
                rel_likes: stock1Likes - stock2Likes
              },
              {
                stock: stockData[1].stock,
                price: stockData[1].price,
                rel_likes: stock2Likes - stock1Likes
              }
            ]
          };
          res.json(result);
        }
        
      } catch (error) {
        console.error('API Error:', error);
        res.json({ error: 'Unable to fetch stock data' });
      }
    });
    
};

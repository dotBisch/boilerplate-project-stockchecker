'use strict';

const crypto = require('crypto');

function anonymizeIp(ip) {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

const fetch = require('node-fetch');

// In-memory storage for likes (resets on server restart)
const stockLikes = new Map();

function createStock(stock, like, ip) {
  const symbol = stock.toUpperCase();
  if (!stockLikes.has(symbol)) {
    stockLikes.set(symbol, new Set());
  }
  if (like) {
    stockLikes.get(symbol).add(ip);
  }
  return {
    symbol: symbol,
    likes: stockLikes.get(symbol).size
  };
}

function findStock(stock) {
  const symbol = stock.toUpperCase();
  if (stockLikes.has(symbol)) {
    return {
      symbol: symbol,
      likes: stockLikes.get(symbol).size
    };
  }
  return null;
}

function saveStock(stock, like, ip) {
  const symbol = stock.toUpperCase();
  if (!stockLikes.has(symbol)) {
    stockLikes.set(symbol, new Set());
  }
  
  if (like && !stockLikes.get(symbol).has(ip)) {
    stockLikes.get(symbol).add(ip);
  }
  
  return {
    symbol: symbol,
    likes: stockLikes.get(symbol).size
  };
}

async function getStock(stock) {
  try {
    const response = await fetch(
      `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`
    );
    if (!response.ok) {
      return { error: 'invalid stock' };
    }
    const { symbol, latestPrice } = await response.json();
    return { symbol, latestPrice };
  } catch (error) {
    return { error: 'invalid stock' };
  }
}

module.exports = function (app) {
  console.log('🔗 API routes being registered...');

  app.route('/api/stock-prices')
    .get(async function (req, res){
      console.log('📊 Stock API request received:', req.query);
      const { stock, like } = req.query;
      const ip = anonymizeIp(req.ip);
      console.log('🔒 Anonymized IP:', ip);

      if (Array.isArray(stock)) {
        const stock1 = stock[0];
        const stock2 = stock[1];

        const stock1Data = await getStock(stock1);
        const stock2Data = await getStock(stock2);

        const dbStock1 = saveStock(stock1, like, ip);
        const dbStock2 = saveStock(stock2, like, ip);
        
        if (!stock1Data.symbol || !stock2Data.symbol) {
            return res.json({ error: 'invalid stock' });
        }

        // Calculate rel_likes once and assign correctly
        const relLikes = dbStock1.likes - dbStock2.likes;
        
        const stockData = [
            {
                stock: stock1Data.symbol,
                price: stock1Data.latestPrice,
                rel_likes: relLikes
            },
            {
                stock: stock2Data.symbol,
                price: stock2Data.latestPrice,
                rel_likes: -relLikes
            }
        ];

        return res.json({ stockData });

      } else {
        const stockData = await getStock(stock);

        if (!stockData.symbol) {
          return res.json({ error: 'invalid stock' });
        }

        const dbStock = saveStock(stock, like, ip);

        return res.json({
          stockData: {
            stock: stockData.symbol,
            price: stockData.latestPrice,
            likes: dbStock.likes,
          },
        });
      }
    });
    
};

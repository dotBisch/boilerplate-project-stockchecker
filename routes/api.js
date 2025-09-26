'use strict';

const crypto = require('crypto');
const fetch = require('node-fetch');

// In-memory storage for likes
const stockLikes = new Map();

// IP anonymization with better extraction
function anonymizeIp(req) {
  // Get real IP from various possible sources
  const ip = req.ip || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress ||
             (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
             req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
             req.headers['x-real-ip'] ||
             '127.0.0.1';
  
  const hashedIp = crypto.createHash('sha256').update(ip).digest('hex');
  
  // Debug logging (remove in production if needed)
  console.log(`🔍 IP Debug - Original: ${ip}, Hashed: ${hashedIp.substring(0, 8)}...`);
  
  return hashedIp;
}

// Fetch stock data from FCC proxy
async function getStock(stock) {
  try {
    const response = await fetch(
      `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`
    );
    if (!response.ok) return { error: 'invalid stock' };
    const { symbol, latestPrice } = await response.json();
    return { symbol, latestPrice };
  } catch {
    return { error: 'invalid stock' };
  }
}

// Save like per IP
function saveLike(stock, like, ip) {
  const symbol = stock.toUpperCase();
  if (!stockLikes.has(symbol)) stockLikes.set(symbol, new Set());
  
  const sizeBefore = stockLikes.get(symbol).size;
  if (like) {
    stockLikes.get(symbol).add(ip);
  }
  const sizeAfter = stockLikes.get(symbol).size;
  
  // Debug logging
  console.log(`💖 Like Debug - ${symbol}: like=${like}, before=${sizeBefore}, after=${sizeAfter}, IP=${ip.substring(0, 8)}...`);
  
  return sizeAfter;
}

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(async function (req, res) {
      const { stock, like } = req.query;
      const ip = anonymizeIp(req);
      const likeFlag = like === 'true';

      // Handle multiple stocks
      if (Array.isArray(stock)) {
        const [stock1, stock2] = stock;
        const [data1, data2] = await Promise.all([
          getStock(stock1),
          getStock(stock2)
        ]);

        if (data1.error || data2.error) {
          return res.json({ error: 'invalid stock' });
        }

        const likes1 = saveLike(stock1, likeFlag, ip);
        const likes2 = saveLike(stock2, likeFlag, ip);
        const relLikes = likes1 - likes2;

        return res.json({
          stockData: [
            {
              stock: data1.symbol,
              price: data1.latestPrice,
              rel_likes: relLikes
            },
            {
              stock: data2.symbol,
              price: data2.latestPrice,
              rel_likes: -relLikes
            }
          ]
        });
      }

      // Handle single stock
      const data = await getStock(stock);
      if (data.error) {
        return res.json({ error: 'invalid stock' });
      }

      const likes = saveLike(stock, likeFlag, ip);
      return res.json({
        stockData: {
          stock: data.symbol,
          price: data.latestPrice,
          likes: likes
        }
      });
    });
};

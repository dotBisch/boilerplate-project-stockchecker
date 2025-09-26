'use strict';

const crypto = require('crypto');
const fetch = require('node-fetch');

// In-memory storage for likes
const stockLikes = new Map();

// IP anonymization
function anonymizeIp(ip) {
  return crypto.createHash('sha256').update(ip).digest('hex');
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
  if (like) stockLikes.get(symbol).add(ip);
  return stockLikes.get(symbol).size;
}

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(async function (req, res) {
      const { stock, like } = req.query;
      const ip = anonymizeIp(req.ip);
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

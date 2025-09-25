'use strict';

const crypto = require('crypto');

function anonymizeIp(ip) {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

const StockModel = require('../models').Stock;
const fetch = require('node-fetch');

async function createStock(stock, like, ip) {
  const newStock = new StockModel({
    symbol: stock.toUpperCase(),
    likes: like ? [ip] : [],
  });
  const savedNew = await newStock.save();
  return savedNew;
}

async function findStock(stock) {
  return await StockModel.findOne({ symbol: stock.toUpperCase() }).exec();
}

async function saveStock(stock, like, ip) {
  let saved = {};
  const foundStock = await findStock(stock);
  if (!foundStock) {
    const createsaved = await createStock(stock, like, ip);
    saved = createsaved;
    return saved;
  } else {
    if (like && foundStock.likes.indexOf(ip) === -1) {
      foundStock.likes.push(ip);
    }
    saved = await foundStock.save();
    return saved;
  }
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

  app.route('/api/stock-prices')
    .get(async function (req, res){
      const { stock, like } = req.query;
      const ip = anonymizeIp(req.ip);

      if (Array.isArray(stock)) {
        const stock1 = stock[0];
        const stock2 = stock[1];

        const stock1Data = await getStock(stock1);
        const stock2Data = await getStock(stock2);

        const dbStock1 = await saveStock(stock1, like, ip);
        const dbStock2 = await saveStock(stock2, like, ip);
        
        let stockData = [];

        if (stock1Data.symbol) {
            stockData.push({
                stock: stock1Data.symbol,
                price: stock1Data.latestPrice,
                rel_likes: dbStock1.likes.length - dbStock2.likes.length
            });
        } else {
            return res.json({ error: 'invalid stock' });
        }

        if (stock2Data.symbol) {
            stockData.push({
                stock: stock2Data.symbol,
                price: stock2Data.latestPrice,
                rel_likes: dbStock2.likes.length - dbStock1.likes.length
            });
        } else {
            return res.json({ error: 'invalid stock' });
        }

        return res.json({ stockData });

      } else {
        const stockData = await getStock(stock);

        if (!stockData.symbol) {
          return res.json({ stockData: { likes: like ? 1 : 0 } });
        }

        const dbStock = await saveStock(stock, like, ip);

        return res.json({
          stockData: {
            stock: stockData.symbol,
            price: stockData.latestPrice,
            likes: dbStock.likes.length,
          },
        });
      }
    });
    
};

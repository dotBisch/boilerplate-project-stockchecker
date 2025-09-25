"use strict";
const StockModel = require("../models").Stock;
const fetch = require("node-fetch");

async function createStock(stock, like, ip) {
  const newStock = new StockModel({
    symbol: stock,
    likes: like ? [ip] : [],
  });
  const savedNew = await newStock.save();
  return savedNew;
}

async function findStock(stock) {
  return await StockModel.findOne({ symbol: stock }).exec();
}

async function saveStock(stock, like, ip) {
  const stockSymbol = stock.toUpperCase();
  let saved = {};
  const foundStock = await findStock(stockSymbol);
  if (!foundStock) {
    const createsaved = await createStock(stockSymbol, like, ip);
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
      `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock.toUpperCase()}/quote`
    );
    const data = await response.json();
    
    // Handle case where stock is not found
    if (!data || data.error || !data.symbol) {
      return { symbol: null, latestPrice: null };
    }
    
    return { symbol: data.symbol, latestPrice: data.latestPrice };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return { symbol: null, latestPrice: null };
  }
}

module.exports = function (app) {
  //https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/TSLA/quote

  app.route("/api/stock-prices").get(async function (req, res) {
    try {
      const { stock, like } = req.query;
      const likeBoolean = like === 'true' || like === true;
      
      // Handle two stocks
      if (Array.isArray(stock)) {
        const [stock1, stock2] = stock;
        
        // Get stock data from API
        const { symbol: symbol1, latestPrice: price1 } = await getStock(stock1);
        const { symbol: symbol2, latestPrice: price2 } = await getStock(stock2);
        
        // Save to database (this handles likes)
        const savedStock1 = await saveStock(stock1, likeBoolean, req.ip);
        const savedStock2 = await saveStock(stock2, likeBoolean, req.ip);
        
        const stockData = [
          {
            stock: symbol1,
            price: price1,
            rel_likes: savedStock1.likes.length - savedStock2.likes.length,
          },
          {
            stock: symbol2,
            price: price2,
            rel_likes: savedStock2.likes.length - savedStock1.likes.length,
          }
        ];

        res.json({ stockData });
        return;
      }
      
      // Handle single stock
      const { symbol, latestPrice } = await getStock(stock);
      
      if (!symbol) {
        res.json({ stockData: { error: 'invalid symbol', likes: 0 } });
        return;
      }

      const savedStock = await saveStock(stock, likeBoolean, req.ip);

      res.json({
        stockData: {
          stock: symbol,
          price: latestPrice,
          likes: savedStock.likes.length,
        },
      });
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'internal server error' });
    }
  });
};

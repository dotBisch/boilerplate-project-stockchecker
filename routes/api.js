"use strict";
const StockModel = require("../models").Stock;
const fetch = require("node-fetch");

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
  const response = await fetch(
    `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`
  );
  const { symbol, latestPrice } = await response.json();
  return { symbol, price: latestPrice };
}

module.exports = function (app) {
  app.route("/api/stock-prices").get(async function (req, res) {
    const { stock, like } = req.query;

    if (Array.isArray(stock)) {
      const [stock1, stock2] = stock;

      const stock1Data = await getStock(stock1);
      const stock2Data = await getStock(stock2);

      const firstStock = await saveStock(stock1, like, req.ip);
      const secondStock = await saveStock(stock2, like, req.ip);
      
      let responseData = [];
      
      if(stock1Data.symbol) {
        responseData.push({
          stock: stock1Data.symbol,
          price: stock1Data.price,
          rel_likes: firstStock.likes.length - secondStock.likes.length
        });
      }

      if(stock2Data.symbol) {
        responseData.push({
          stock: stock2Data.symbol,
          price: stock2Data.price,
          rel_likes: secondStock.likes.length - firstStock.likes.length
        });
      }

      return res.json({ stockData: responseData });

    }

    const { symbol, price } = await getStock(stock);

    if (!symbol) {
      const stockData = await saveStock(stock, like, req.ip);
      res.json({
        stockData: {
          stock: stock.toUpperCase(),
          price: null,
          likes: stockData.likes.length,
        },
      });
      return;
    }

    const oneStockData = await saveStock(symbol, like, req.ip);

    res.json({
      stockData: {
        stock: symbol,
        price: price,
        likes: oneStockData.likes.length,
      },
    });
  });
};

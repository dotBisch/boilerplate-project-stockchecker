const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const { connectDB } = require('../db');
const server = require('../server');

chai.use(chaiHttp);

// Ensure database is connected before running tests
before(async function() {
  this.timeout(10000);
  await connectDB();
});

suite('Functional Tests', function() {
  
  suite('GET /api/stock-prices => stockData object', function() {
    
    test('Viewing one stock', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'GOOG'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'response should be an object');
          assert.property(res.body, 'stockData', 'StockData should be a property');
          assert.property(res.body.stockData, 'stock', 'StockData should have a stock property');
          assert.property(res.body.stockData, 'price', 'StockData should have a price property');
          assert.property(res.body.stockData, 'likes', 'StockData should have a likes property');
          assert.equal(res.body.stockData.stock, 'GOOG');
          done();
        });
    });
    
    let likes;
    
    test('Viewing one stock and liking it', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'GOOG', like: true})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'response should be an object');
          assert.property(res.body, 'stockData', 'StockData should be a property');
          assert.property(res.body.stockData, 'stock', 'StockData should have a stock property');
          assert.property(res.body.stockData, 'price', 'StockData should have a price property');
          assert.property(res.body.stockData, 'likes', 'StockData should have a likes property');
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.isAbove(res.body.stockData.likes, 0, 'Likes should be greater than 0');
          likes = res.body.stockData.likes;
          done();
        });
    });
    
    test('Viewing the same stock and liking it again', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'GOOG', like: true})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'response should be an object');
          assert.property(res.body, 'stockData', 'StockData should be a property');
          assert.equal(res.body.stockData.likes, likes, 'Likes should not increase');
          done();
        });
    });
    
    test('Viewing two stocks', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['GOOG', 'MSFT']})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'response should be an object');
          assert.property(res.body, 'stockData', 'StockData should be a property');
          assert.isArray(res.body.stockData, 'StockData should be an array');
          assert.equal(res.body.stockData.length, 2, 'StockData should have 2 elements');
          assert.property(res.body.stockData[0], 'stock', 'StockData should have a stock property');
          assert.property(res.body.stockData[0], 'price', 'StockData should have a price property');
          assert.property(res.body.stockData[0], 'rel_likes', 'StockData should have a rel_likes property');
          done();
        });
    });
    
    test('Viewing two stocks and liking them', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['GOOG', 'MSFT'], like: true})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'response should be an object');
          assert.property(res.body, 'stockData', 'StockData should be a property');
          assert.isArray(res.body.stockData, 'StockData should be an array');
          assert.equal(res.body.stockData.length, 2, 'StockData should have 2 elements');
          assert.property(res.body.stockData[0], 'stock', 'StockData should have a stock property');
          assert.property(res.body.stockData[0], 'price', 'StockData should have a price property');
          assert.property(res.body.stockData[0], 'rel_likes', 'StockData should have a rel_likes property');
          done();
        });
    });
    
  });

});

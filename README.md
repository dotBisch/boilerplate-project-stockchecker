# Stock Price Checker

A lightweight JavaScript app for checking real-time stock prices with in-memory like tracking, built for the freeCodeCamp Information Security curriculum.

## Features

- View real-time stock prices using the [freeCodeCamp Stock Price Proxy API](https://stock-price-checker-proxy.freecodecamp.rocks/)
- Like a stock (one like per IP, anonymized for privacy) - stored in memory
- Compare two stocks and see the relative difference in likes
- Security features including strict Content Security Policy
- **No database required** - runs entirely API-based with in-memory storage

## Usage

### Installation

1. Clone this repository:
   ```
   git clone https://github.com/sabbas-ctrl/Stock-Price-Checker.git
   cd Stock-Price-Checker
   ```
2. Install dependencies:
   ```
   npm install
   ```

### Running Locally

Start the server:
```
npm run dev
```
Visit [http://localhost:3000/](http://localhost:3000/) in your browser.

### API Endpoints

#### GET `/api/stock-prices`

**Query Parameters:**
- `stock` (string or array): NASDAQ stock symbol(s) (e.g., `GOOG` or `['GOOG','MSFT']`)
- `like` (boolean, optional): Set to `true` to like the stock(s)

**Examples:**
- `/api/stock-prices?stock=GOOG`
- `/api/stock-prices?stock=GOOG&like=true`
- `/api/stock-prices?stock=GOOG&stock=MSFT`
- `/api/stock-prices?stock=GOOG&stock=MSFT&like=true`

**Response:**
- For one stock:
  ```json
  {
    "stockData": {
      "stock": "GOOG",
      "price": 1234.56,
      "likes": 5
    }
  }
  ```
- For two stocks:
  ```json
  {
    "stockData": [
      {
        "stock": "GOOG",
        "price": 1234.56,
        "rel_likes": 1
      },
      {
        "stock": "MSFT",
        "price": 234.56,
        "rel_likes": -1
      }
    ]
  }
  ```

## Architecture

- **API-only**: No database required - likes are stored in memory
- **Stateless**: Server restarts will reset all like data
- **External API**: Stock prices fetched from freeCodeCamp's proxy API

## Security

- Content Security Policy restricts scripts and CSS to your server only.
- IP addresses are anonymized before storing likes, in compliance with privacy laws.
- In-memory storage ensures no persistent data collection.

## Testing

Run all tests:
```
npm test
```
Functional tests are located in `tests/2_functional-tests.js`.

## License

MIT


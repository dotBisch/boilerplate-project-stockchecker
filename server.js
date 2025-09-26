'use strict';
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./db');
const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');

// Only require test-runner in test environment
let runner;
if (process.env.NODE_ENV === 'test') {
  try {
    runner = require('./test-runner');
  } catch (e) {
    console.log('Warning: test-runner not available:', e.message);
  }
}

// Connect to database
connectDB();

const app = express();

// Security with helmet - Content Security Policy
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "https://cdn.freecodecamp.org"]
    }
  }
}));

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'"]
  }
}));

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    console.log('📋 Homepage request received');
    try {
      res.sendFile(process.cwd() + '/views/index.html');
    } catch (error) {
      console.error('❌ Error serving homepage:', error);
      res.status(500).send('Server Error');
    }
  });

//Health check route
app.get('/health', (req, res) => {
  console.log('💚 Health check request received');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 3000,
    cwd: process.cwd()
  });
});

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);  
    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if(process.env.NODE_ENV==='test' && runner) {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 3500);
  }
});

module.exports = app; //for testing

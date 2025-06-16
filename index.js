require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');

const app = express();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(express.json()); // For parsing application/json
// Basic Configuration
const port = process.env.PORT || 3000;

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});
// In-memory database
const urlDatabase = {};
let urlId = 1;

// POST endpoint to shorten URL
app.post('/api/shorturl', (req, res) => {
  const userUrl = req.body.url;

  let urlObj;
  try {
    urlObj = new URL(userUrl);
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(urlObj.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Store URL and respond
    const currentId = urlId++;
    urlDatabase[currentId] = userUrl;

    res.json({
      original_url: userUrl,
      short_url: currentId
    });
  });
});

// GET endpoint to redirect short URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

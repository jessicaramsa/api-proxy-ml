const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

require('dotenv').config();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';
const BASE_URL = `${HOST}:${PORT}`;
const API_SERVICE_URL = process.env.API_SERVICE_URL;

const app = express();

app.use(cors());
app.listen(PORT, HOST, () => console.log(`Proxy started on ${BASE_URL}`));

// Proxy
app.use(createProxyMiddleware({
  target: API_SERVICE_URL,
  changeOrigin: true
}));

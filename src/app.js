const express = require('express');
const client = require('prom-client');
const os = require('os');

const app = express();
app.use(express.json());

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});
const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.25, 0.5, 1, 2],
  registers: [register],
});

app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    const labels = {
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status: res.statusCode,
    };
    httpRequests.inc(labels);
    end(labels);
  });
  next();
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const products = [
  { id: 1, name: 'Smart Speaker', price: 49.99, stock: 120 },
  { id: 2, name: 'E-Reader', price: 99.99, stock: 80 },
  { id: 3, name: 'Streaming Stick', price: 39.99, stock: 200 },
];
const orders = [];

app.get('/', (req, res) => {
  res.json({
    service: 'amazon-service',
    team: 'catalog-and-orders (two-pizza team)',
    version: process.env.APP_VERSION || '1.0.0',
    pod: os.hostname(),
  });
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/products', async (req, res) => {
  await sleep(Math.random() * 60);
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'product not found' });
  res.json(product);
});

app.post('/api/orders', (req, res) => {
  const { productId, quantity = 1 } = req.body || {};
  const product = products.find((p) => p.id === Number(productId));
  if (!product) return res.status(400).json({ error: 'invalid productId' });
  const order = {
    id: orders.length + 1,
    productId: product.id,
    quantity,
    total: +(product.price * quantity).toFixed(2),
    status: 'PLACED',
    handledBy: os.hostname(),
  };
  orders.push(order);
  res.status(201).json(order);
});

app.get('/api/orders', (req, res) => res.json(orders));

app.get('/chaos/error', (req, res) => {
  res.status(500).json({ error: 'simulated failure' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

module.exports = app;
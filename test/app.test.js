const { test, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

let server;
let base;

before(
  () =>
    new Promise((resolve) => {
      server = app.listen(0, () => {
        base = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    })
);

after(() => {
  server.closeAllConnections();
  server.close();
});

test('health endpoint returns ok', async () => {
  const res = await fetch(`${base}/health`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual((await res.json()).status, 'ok');
});

test('products endpoint returns a list', async () => {
  const res = await fetch(`${base}/api/products`);
  const body = await res.json();
  assert.ok(Array.isArray(body) && body.length > 0);
});

test('placing an order returns 201', async () => {
  const res = await fetch(`${base}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: 1, quantity: 2 }),
  });
  const body = await res.json();
  assert.strictEqual(res.status, 201);
  assert.strictEqual(body.total, 99.98);
});

test('invalid order is rejected', async () => {
  const res = await fetch(`${base}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: 999 }),
  });
  assert.strictEqual(res.status, 400);
});
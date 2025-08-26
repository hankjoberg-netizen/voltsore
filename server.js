const path = require('path');
const fs = require('fs');
const express = require('express');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));

const asMoney = (n) => Number(n).toFixed(2);
const PRODUCTS = JSON.parse(fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8'));

app.get('/', (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  let list = PRODUCTS;
  if (q) {
    list = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
  } else {
    list = PRODUCTS.slice(0, 8); // 4 x 2 on homepage
  }
  res.render('index', { products: list, q, asMoney, title: 'Shop Tech Gadgets' });
});

app.get('/product/:id', (req, res) => {
  const p = PRODUCTS.find(x => String(x.id) === String(req.params.id));
  if (!p) return res.status(404).send('Not found');
  res.render('product', { p, asMoney, title: p.name });
});

app.get('/cart', (req, res) => res.render('cart', { title: 'Cart' }));
app.get('/checkout/success', (req, res) => res.render('checkout_success', { title: 'Thanks!' }));
app.get('/checkout/cancel', (req, res) => res.render('checkout_cancel', { title: 'Canceled' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));

if (process.env.VERCEL || process.env.NOW_REGION) {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`VoltStore running http://localhost:${PORT}`));
}

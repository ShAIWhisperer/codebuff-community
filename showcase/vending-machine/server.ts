import express from 'express';
import path from 'path';
import { VendingMachine, Product } from './vending-machine';

const app = express();
const port = 3000;

// Initialize vending machine with products
const initialProducts: Product[] = [
  { id: 'A1', name: 'Soda', price: 125, quantity: 10 },
  { id: 'B1', name: 'Chips', price: 100, quantity: 5 },
  { id: 'C1', name: 'Candy', price: 65, quantity: 20 },
];

const vm = new VendingMachine(initialProducts);

app.use(express.json());
app.use(express.static('public'));

// API Routes
app.get('/api/products', (req, res) => {
  const products = vm.getProducts();
  res.json({ products, balance: vm.getBalance() });
});

app.post('/api/insert', (req, res) => {
  const { coin } = req.body;
  const success = vm.insertCoin(coin);
  res.json({ success, balance: vm.getBalance() });
});

app.post('/api/select', (req, res) => {
  const { productId } = req.body;
  const product = vm.getProduct(productId);
  
  if (!product) {
    return res.json({ success: false, message: `Product ${productId} does not exist.` });
  }
  if (product.quantity <= 0) {
    return res.json({ success: false, message: `Product ${product.name} is out of stock.` });
  }
  if (vm.getBalance() < product.price) {
    return res.json({ 
      success: false, 
      message: `Insufficient balance. ${product.name} costs ${product.price} cents. Current balance: ${vm.getBalance()} cents.`
    });
  }

  vm.selectProduct(productId);
  const message = `Dispensing ${product.name}. Remaining balance: ${vm.getBalance()} cents.`;
  
  res.json({ success: true, message, balance: vm.getBalance() });
});

app.post('/api/refund', (req, res) => {
  const amount = vm.getBalance();
  vm.refund();
  res.json({ success: true, amount });
});

app.post('/api/restock', (req, res) => {
  const initialProducts: Product[] = [
    { id: 'A1', name: 'Soda', price: 125, quantity: 10 },
    { id: 'B1', name: 'Chips', price: 100, quantity: 5 },
    { id: 'C1', name: 'Candy', price: 65, quantity: 20 },
  ];
  
  vm.restock(initialProducts);
  res.json({ success: true, products: vm.getProducts() });
});

app.listen(port, () => {
  console.log(`Vending machine UI available at http://localhost:${port}`);
});

import { VendingMachine, Product } from './vending-machine';
import * as readline from 'readline';

const initialProducts: Product[] = [
  { id: 'A1', name: 'Soda', price: 125, quantity: 10 },
  { id: 'B1', name: 'Chips', price: 100, quantity: 5 },
  { id: 'C1', name: 'Candy', price: 65, quantity: 20 },
];

const vm = new VendingMachine(initialProducts);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(): void {
  rl.question('> ', (input: string) => {
    const tokens = input.trim().split(' ');
    const command = tokens[0].toLowerCase();

    switch (command) {
      case 'insert': {
        const coin = parseInt(tokens[1], 10);
        if (isNaN(coin)) {
          console.log('Invalid coin value.');
        } else {
          vm.insertCoin(coin);
        }
        break;
      }
      case 'select': {
        const productId = tokens[1];
        vm.selectProduct(productId);
        break;
      }
      case 'display': {
        vm.displayProducts();
        break;
      }
      case 'refund': {
        vm.refund();
        break;
      }
      case 'exit': {
        rl.close();
        return;
      }
      default:
        console.log('Unknown command. Use: insert <coin>, select <productId>, display, refund, or exit.');
    }
    prompt();
  });
}

console.log("Welcome to the Vending Machine!");
vm.displayProducts();
prompt();

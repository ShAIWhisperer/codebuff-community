export interface Product {
  id: string;
  name: string;
  price: number; // price in cents
  quantity: number;
}

export class VendingMachine {
  private products: Map<string, Product>;
  private balance: number;
  private acceptedCoins: number[];

  constructor(initialProducts: Product[]) {
    this.products = new Map();
    initialProducts.forEach(product => this.products.set(product.id, product));
    this.balance = 0;
    this.acceptedCoins = [5, 10, 25, 50, 100];
  }

  public getProducts(): Product[] {
    return Array.from(this.products.values());
  }

  public getProduct(id: string): Product | undefined {
    return this.products.get(id);
  }

  public getBalance(): number {
    return this.balance;
  }

  insertCoin(coin: number): boolean {
    if (this.acceptedCoins.includes(coin)) {
      this.balance += coin;
      console.log(`Inserted coin: ${coin} cents. Current balance: ${this.balance} cents.`);
      return true;
    }
    console.log(`Coin of ${coin} cents not accepted.`);
    return false;
  }

  selectProduct(productId: string): void {
    const product = this.products.get(productId);
    if (!product) {
      console.log(`Product with id ${productId} does not exist.`);
      return;
    }
    if (product.quantity <= 0) {
      console.log(`Product ${product.name} is out of stock.`);
      return;
    }
    if (this.balance < product.price) {
      console.log(`Insufficient balance. ${product.name} costs ${product.price} cents. Current balance: ${this.balance} cents.`);
      return;
    }
    
    product.quantity -= 1;
    this.balance -= product.price;
    console.log(`Dispensing ${product.name}. Remaining balance: ${this.balance} cents.`);
    
    // Dispense change if any
    if (this.balance > 0) {
      this.dispenseChange();
    }
  }

  dispenseChange(): void {
    let change = this.balance;
    const changeCoins: number[] = [];
    // Use a greedy algorithm using sorted (descending) coins
    const sortedCoins = this.acceptedCoins.slice().sort((a, b) => b - a);
    for (const coin of sortedCoins) {
      while (change >= coin) {
        changeCoins.push(coin);
        change -= coin;
      }
    }
    console.log(`Dispensing change: ${changeCoins.join(', ')} cents.`);
    this.balance = 0;
  }

  refund(): void {
    console.log(`Refunding balance: ${this.balance} cents.`);
    this.balance = 0;
  }

  displayProducts(): void {
    console.log("Available products:");
    this.products.forEach(product => {
      console.log(`${product.id}: ${product.name} - ${product.price} cents (${product.quantity} left)`);
    });
  }

  public restock(products: Product[]): void {
    products.forEach(product => {
      const existingProduct = this.products.get(product.id);
      if (existingProduct) {
        existingProduct.quantity = product.quantity;
      }
    });
  }
}

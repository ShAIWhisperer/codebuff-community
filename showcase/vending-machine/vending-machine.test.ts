import { VendingMachine, Product } from './vending-machine';

describe('VendingMachine', () => {
  let vm: VendingMachine;
  const initialProducts: Product[] = [
    { id: 'A1', name: 'Soda', price: 125, quantity: 2 },
    { id: 'B1', name: 'Chips', price: 100, quantity: 1 },
    { id: 'C1', name: 'Candy', price: 65, quantity: 0 },
  ];

  beforeEach(() => {
    vm = new VendingMachine(initialProducts);
  });

  // Positive test cases
  describe('positive cases', () => {
    test('should accept valid coins', () => {
      expect(vm.insertCoin(25)).toBe(true);
      expect(vm.insertCoin(100)).toBe(true);
    });

    test('should successfully dispense product with exact change', () => {
      vm.insertCoin(100);
      vm.insertCoin(25);
      const spy = jest.spyOn(console, 'log');
      vm.selectProduct('A1');
      expect(spy).toHaveBeenCalledWith('Dispensing Soda. Remaining balance: 0 cents.');
    });

    test('should dispense change correctly', () => {
      vm.insertCoin(100);
      vm.insertCoin(100);
      const spy = jest.spyOn(console, 'log');
      vm.selectProduct('B1');
      expect(spy).toHaveBeenCalledWith('Dispensing change: 100 cents.');
    });
  });

  // Negative test cases
  describe('negative cases', () => {
    test('should reject invalid coins', () => {
      expect(vm.insertCoin(30)).toBe(false);
      expect(vm.insertCoin(0)).toBe(false);
      expect(vm.insertCoin(-5)).toBe(false);
    });

    test('should handle insufficient funds', () => {
      vm.insertCoin(25);
      const spy = jest.spyOn(console, 'log');
      vm.selectProduct('A1');
      expect(spy).toHaveBeenCalledWith(
        'Insufficient balance. Soda costs 125 cents. Current balance: 25 cents.'
      );
    });

    test('should handle non-existent product selection', () => {
      const spy = jest.spyOn(console, 'log');
      vm.selectProduct('D1');
      expect(spy).toHaveBeenCalledWith('Product with id D1 does not exist.');
    });
  });

  // Boundary test cases
  describe('boundary cases', () => {
    test('should handle out of stock products', () => {
      vm.insertCoin(100);
      const spy = jest.spyOn(console, 'log');
      vm.selectProduct('C1');
      expect(spy).toHaveBeenCalledWith('Product Candy is out of stock.');
    });

    test('should handle last item in stock', () => {
      vm.insertCoin(100);
      vm.selectProduct('B1');
      const spy = jest.spyOn(console, 'log');
      vm.insertCoin(100);
      vm.selectProduct('B1');
      expect(spy).toHaveBeenCalledWith('Product Chips is out of stock.');
    });

    test('should handle maximum possible transaction', () => {
      // Insert enough coins for most expensive item
      vm.insertCoin(100);
      vm.insertCoin(25);
      const spy = jest.spyOn(console, 'log');
      vm.selectProduct('A1');
      expect(spy).toHaveBeenCalledWith('Dispensing Soda. Remaining balance: 0 cents.');
    });
  });

  // Refund tests
  describe('refund functionality', () => {
    test('should refund inserted money', () => {
      vm.insertCoin(25);
      vm.insertCoin(10);
      const spy = jest.spyOn(console, 'log');
      vm.refund();
      expect(spy).toHaveBeenCalledWith('Refunding balance: 35 cents.');
    });

    test('should handle refund with no balance', () => {
      const spy = jest.spyOn(console, 'log');
      vm.refund();
      expect(spy).toHaveBeenCalledWith('Refunding balance: 0 cents.');
    });
  });
});

export class Product {
    id?: string;
    name: string;
    price: number;
  
    constructor(name: string, price: number, id: string = '') {
      if (price < 0) {
        throw new Error("El precio no puede ser negativo");
      }
  
      this.id = id;
      this.name = name;
      this.price = price;
    }
  }
  
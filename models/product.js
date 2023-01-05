const fs = require('fs');
const path = require('path');

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'products.json'
);

const getProductsFromFile = cb => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    this.id = Math.random().toString();
    getProductsFromFile(products => {
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), err => {
        console.log(err);
      });
    });
  }

  update(cb) {
    getProductsFromFile((products) => {
      const index = products.findIndex((prod) => prod.id === this.id);
      products[index] = this;
      console.log(products);
      fs.writeFile(p, JSON.stringify(products), err => {
        console.log(err);
      });
    })
  }

  static delete(id) {
    getProductsFromFile((products) => {
      products = products.filter((prod) => prod.id !== id);
      fs.writeFile(p, JSON.stringify(products), err => {
        console.log(err);
      });
    })
  }

  static getProductWithId(id, cb) {
    getProductsFromFile((prods) => {
      const product = prods.find((prod) => prod.id === id)
      cb(product);
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }
};

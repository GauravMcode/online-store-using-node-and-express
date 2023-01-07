const fs = require('fs');
const path = require('path');

const db = require('../util/database');

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
    console.log(this);
    return db.execute(`INSERT INTO products (title, imageUrl, description, price) VALUES ("${this.title}", "${this.imageUrl}", "${this.description}", "${this.price}")`);
  }
  //`INSERT INTO products (title, imageUrl, description, price) VALUES ("${this.title}", "${this.imageUrl}", "${this.description}", "${this.price}")` 

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

  static getProductWithId(id) {
    return db.execute(`SELECT * FROM products WHERE products.id = ${id}`);
  }

  static fetchAll() {
    return db.execute('SELECT * FROM products');
  }
};

const fs = require('fs');
const path = require('path');

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'cart.json'
);

const getCartItems = (cb) => {
    const cart = fs.readFile(p, (err, data) => {
        if (!err && data) {
            const cartData = JSON.parse(data);
            cb(cartData);
        } else {
            cb({});
        }
    });
}

module.exports = class Cart {
    constructor(products, totalPrice) {
        this.products = products;
        this.totalPrice = totalPrice;
    }

    save() {
        getCartItems((cart) => {
            cart.products = this.products;
            cart.totalPrice = this.totalPrice;
            const cartData = JSON.stringify(cart);
            fs.writeFile(p, cartData, (err) => {
                console.log(err);
            });
        });
    }

    static fetchCart(cb) {
        getCartItems((cart) => {
            cb(cart);
        })
    }

    static delete(id, price, cb) {
        getCartItems((cart) => {
            if (cart.products.length === 0) {
                cart.totalPrice = 0.0;
            } else {
                const totalPrice = cart.totalPrice - cart.products.find((prod) => prod.id === id).qty * price;
                cart.totalPrice = totalPrice;
            }
            cart.products = cart.products.filter((prod) => prod.id !== id);
            fs.writeFile(p, JSON.stringify(cart), err => {
                cb();
                console.log(err);
            });
        })
    }

}

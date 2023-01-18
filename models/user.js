const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [{
            productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, require: true }
        }]
    }
})


userSchema.methods.addToCart = function (prodId) {
    if (!this.cart.items) {
        console.log('no cart');
        const cartItems = { productId: prodId, quantity: 1 };
        this.cart = { items: [cartItems] };
        return this.save();
    }
    const productIndex = this.cart.items.findIndex(prodObj => {
        return prodObj.productId.toString() === prodId;
    });
    let newQuantity = 1;
    let newItems = [...this.cart.items];
    if (productIndex >= 0) {
        newQuantity = this.cart.items[productIndex].quantity + 1;
        newItems[productIndex].quantity = newQuantity;
    } else {
        newItems.push({ productId: prodId, quantity: 1 });
    }
    this.cart = { items: newItems };
    return this.save();
}

userSchema.methods.deleteCartItem = function (prodId) {
    const prodIndex = this.cart.items.findIndex(prodObj => prodObj.productId.toString() === prodId);
    const cartItems = [...this.cart.items];
    cartItems.splice(prodIndex, 1);
    this.cart.items = cartItems;
    return this.save();
}

userSchema.methods.clearCart = function () {
    this.cart = { items: [] }
    return this.save();
}

module.exports = mongoose.model('User', userSchema);



// const mongodb = require('mongodb');

// const getdb = require('./../util/database').getdb;

// class User {
//     constructor(username, email, cart, id) {
//         this.username = username,
//             this.email = email,
//             this.cart = cart ?? {},
//             this._id = id
//     }

//     save() {
//         const db = getdb();
//         return db.collection('users').insertOne(this)
//             .then(result => console.log(result))
//             .catch(err => console.log(err))
//     }

//     static findById(userId) {
//         const db = getdb();
//         return db.collection('users').find({ _id: new mongodb.ObjectId(userId) })
//             .next()
//             .then(result => result)
//             .catch(err => console.log(err))
//     }

//     getCart() {
//         const db = getdb();
//         const prods = this.cart.items.map(p => p.productId);
//         console.log('products ids in cart ' + prods);
//         return db.collection('products')
//             .find({ _id: { $in: prods } })
//             .toArray()
//             .then(products => {
//                 return products.map(prod => {
//                     return { ...prod, quantity: this.cart.items.find(item => item.productId.toString() === prod._id.toString()).quantity }
//                 })
//             })
//     }

//     addTOCart(prodId) {
//         const db = getdb();
//         console.log(this.cart.items);
//         if (!this.cart.items) {
//             console.log('no cart');
//             const cartItems = { productId: new mongodb.ObjectId(prodId), quantity: 1 };
//             this.cart = { items: [cartItems] };
//             return db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: this });
//         }
//         const productIndex = this.cart.items.findIndex(prodObj => {
//             return prodObj.productId.toString() === prodId;
//         });
//         let newQuantity = 1;
//         let newItems = [...this.cart.items];
//         if (productIndex >= 0) {
//             newQuantity = this.cart.items[productIndex].quantity + 1;
//             newItems[productIndex].quantity = newQuantity;
//         } else {
//             newItems.push({ productId: new mongodb.ObjectId(prodId), quantity: 1 });
//         }

//         return db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items: newItems } } })
//     }

//     addOrder() {
//         const db = getdb();
//         return this.getCart()
//             .then(products => {
//                 const order = {
//                     items: products,
//                     user: {
//                         _id: new mongodb.ObjectId(this._id),
//                         name: this.username
//                     }
//                 }
//                 return db.collection('orders').insertOne(order);
//             })
//             .then(result => {
//                 return db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items: [] } } })
//             })
//             .catch(err => console.log(err));
//     }

//     getOrders() {
//         const db = getdb();
//         return db.collection('orders').find({ 'user._id': new mongodb.ObjectId(this._id) }).toArray();
//     }

//     deleteById(prodId) {
//         const prodIndex = this.cart.items.findIndex(prodObj => prodObj.productId.toString() === prodId);
//         const cartItems = [...this.cart.items];
//         cartItems.splice(prodIndex, 1);
//         const db = getdb();
//         return db.collection('users').updateOne({ _id: this._id }, { $set: { cart: { items: cartItems } } })
//     }
// }

// module.exports = User;
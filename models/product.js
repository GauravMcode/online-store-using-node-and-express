const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//Schema defines how the data would be structured in our application
const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Product', productSchema);  //('name to be asssigned to model' , the Schema)
//model is a function we call to  basically connect a schema, a blueprint with a name basically, behind the scenes






// const mongodb = require('mongodb');

// const getDb = require('./../util/database').getdb;  //to access the database

// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title,
//       this.price = price,
//       this.description = description,
//       this.imageUrl = imageUrl,
//       this._id = new mongodb.ObjectId(id)
//     this.userId = userId
//   }

//   save() {
//     const db = getDb();  //accessing the db instance
//     return db.collection('products').insertOne(this) /* to tell mongodb, in which collection we need to store our data
//                                               (if not exists, it will created when we insert data for first time just as in the case of database)*/
//       .then(result => {
//         console.log(result);
//       })
//       .catch(err => console.log(err));
//   }

//   update() {
//     const db = getDb();
//     return db.collection('products').updateOne({ _id: this._id }, { $set: this })  //(filter to get value to update, new updated value)
//       .then(result => console.log(result))
//       .catch(err => console.log(err))
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db.collection('products')
//       .find()
//       .toArray()
//       .then(products => {
//         // console.log(products);
//         return products;
//       })
//       .catch(err => console.log(err))
//   }

//   static findById(id) {
//     console.log(id);
//     const db = getDb();
//     return db.collection('products')
//       .find({ _id: new mongodb.ObjectId(id) })
//       .next()    //to get the last document that was returned by find here.
//       .then(product => {
//         // console.log(product);
//         return product;
//       })
//       .catch(err => console.log(err));
//   }

//   static deleteById(id) {
//     const db = getDb();
//     return db.collection('products')
//       .deleteOne({ _id: new mongodb.ObjectId(id) })
//       .then(() => {
//         console.log('deleted');
//       })
//       .catch(err => console.log(err))
//   }
// }

// module.exports = Product;
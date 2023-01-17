
const { deleteById } = require('../models/product');
const Product = require('../models/product');
// const Cart = require('../models/cart');
// const User = require('../models/user');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true,
    isAuthenticated: req.session.isLoggedIn
  });
};


exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({ title: title, price: price, description: description, imageUrl: imageUrl, userId: req.session.user._id });
  product.save()   //save is the method by mongoose for that model
    .then((result) => {    //although save method doesn't returns a promise but gives a then & catch bloc
      console.log('product added');
      res.redirect('/admin/products');
    })
    .catch((err) => { console.log(err); });
};

exports.getEditProduct = (req, res, next) => {
  const prodId = req.params.productId;
  const editMode = req.query.edit
  console.log(editMode);
  Product.findById(prodId)
    .then((product) => {
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/products',
        product: product,
        editing: editMode,
        formsCSS: true,
        productCSS: true,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.id;
  console.log(prodId);
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  Product.findById(prodId)
    .then(product => {
      //product returned by findById is not a JS object but is a complete mongoose object. Therefore, we can call methods like save() on it
      product.title = title,
        product.price = price,
        product.imageUrl = imageUrl,
        product.description = description
      return product.save()  //if save is passed to an existing product, it won't create a new product; instead it will update it.
    })
    .then(() => {
      res.redirect('../admin/products');
    })
    .catch(err => console.log(err))
}

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        isAuthenticated: req.session.isLoggedIn
      });
    }).catch(err => { console.log(err); });
};

exports.deleteProduct = (req, res, next) => {
  const id = req.body.id;
  Product.findByIdAndRemove(id)
    .then(result => {
      res.redirect('../admin/products');
    })
    .catch(err => console.log(err))
}
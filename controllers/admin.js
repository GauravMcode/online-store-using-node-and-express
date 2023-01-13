
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
    activeAddProduct: true
  });
};


exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product(title, price, description, imageUrl, null, req.user._id);
  product.save()
    .then((result) => {
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
  const product = new Product(title, price, description, imageUrl, prodId);
  product.update()
    .then(() => {
      res.redirect('/');
    })
    .catch(err => console.log(err))
}

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    }).catch(err => { console.log(err); });
};

exports.deleteProduct = (req, res, next) => {
  const id = req.body.id;
  Product.deleteById(id)
    .then((prod) => {
      return req.user.deleteById(id);
    })
    .then(result => {
      res.redirect('../admin/products');
    })
    .catch(err => console.log(err))
}
const sequelize = require('sequelize');

const Product = require('../models/product');
const Cart = require('../models/cart');
const User = require('../models/user');

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
  req.user.createProduct({   /* as req.user is a complete sequelize object, 
                              thus it contains various auto created mehtods which were created due to relationship that we defined*/
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
  })
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
  req.user.getProducts({ where: { id: prodId } })
    .then((products) => {
      const product = products[0];
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
  Product.findByPk(prodId)
    .then((prod) => {
      prod.title = req.body.title;
      prod.imageUrl = req.body.imageUrl;
      prod.price = req.body.price;
      prod.description = req.body.description;
      prod.save();
    })
    .then(() => {
      res.redirect('/');
    })
    .catch(err => console.log(err))
}

exports.getProducts = (req, res, next) => {
  req.user.getProducts()
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
  Product.findByPk(id)
    .then((prod) => {
      prod.destroy();
      res.redirect('../admin/products');
    })
    .catch(err => console.log(err))
}
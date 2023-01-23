
const { deleteById } = require('../models/product');
const Product = require('../models/product');

const { validationResult } = require('express-validator/check');

error500 = (err, next) => {
  const error = new Error(err);
  error.httpStatusCode = 500;
  return next(error);
}


exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    errors: false,
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true,
    errorMessage: req.flash('error')[0],
    olderInput: {
      title: '',
      imageUrl: '',
      price: '',
      description: '',
    },
    validatorErrors: []
  });
};


exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      errors: true,
      formsCSS: true,
      productCSS: true,
      activeAddProduct: true,
      errorMessage: errors.array()[0].msg,
      olderInput: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
      },
      validatorErrors: errors.array()
    });
  }
  const product = new Product({ title: title, price: price, description: description, imageUrl: imageUrl, userId: req.session.user._id });
  product.save()   //save is the method by mongoose for that model
    .then((result) => {    //although save method doesn't returns a promise but gives a then & catch bloc
      console.log('product added');
      res.redirect('/admin/products');
    })
    .catch((err) => { error500(err, next); });
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
        errors: false,
        formsCSS: true,
        productCSS: true,
        errorMessage: req.flash('error')[0],
        olderInput: {
          title: '',
          imageUrl: '',
          price: '',
          description: '',
        },
        validatorErrors: []
      });
    })
    .catch(err => {
      error500(err, next);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.id;
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  console.log(prodId);
  Product.findById(prodId)
    .then(product => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
          pageTitle: 'Add Product',
          path: '/admin/add-product',
          editing: true,
          errors: true,
          product: product,
          formsCSS: true,
          productCSS: true,
          activeAddProduct: true,
          errorMessage: errors.array()[0].msg,
          olderInput: {
            title: title,
            imageUrl: imageUrl,
            price: price,
            description: description,
          },
          validatorErrors: errors.array()
        });
      }

      //product returned by findById is not a JS object but is a complete mongoose object. Therefore, we can call methods like save() on it
      else if (product.userId.toString() !== req.session.user._id.toString()) {
        return res.redirect('/');  //the product is not created by the current user, thus redirect
      }
      product.title = title,
        product.price = price,
        product.imageUrl = imageUrl,
        product.description = description
      product.save()  //if save is passed to an existing product, it won't create a new product; instead it will update it.
        .then(() => {
          res.redirect('../admin/products');
        })
    })
    .catch(err => {
      error500(err, next);
    })
}

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.session.user._id })
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
      });
    }).catch(err => { console.log(err); });
};

exports.deleteProduct = (req, res, next) => {
  const id = req.body.id;
  Product.deleteOne({ _id: id, userId: req.session.user._id })
    .then(result => {
      res.redirect('../admin/products');
    })
    .catch(err => {
      error500(err, next);
    })
}
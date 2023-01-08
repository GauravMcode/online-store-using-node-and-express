const Product = require('../models/product');
const Cart = require('../models/cart');

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

};

exports.getEditProduct = (req, res, next) => {
  const prodId = req.params.productId;
  const editMode = req.query.edit
  console.log(editMode);
  Product.getProductWithId(prodId, (product) => {
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/products',
      product: product,
      editing: editMode,
      formsCSS: true,
      productCSS: true,
    });
  })

};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.id;
  console.log(prodId);
  Product.getProductWithId(prodId, (prod) => {
    prod.title = req.body.title;
    prod.imageUrl = req.body.imageUrl;
    prod.price = req.body.price;
    prod.description = req.body.description;
    const product = new Product(prod.title, prod.imageUrl, prod.description, prod.price);
    product.id = prodId;
    product.update();
    res.redirect('/products');
  })
}

exports.getProducts = (req, res, next) => {
  Product.fetchAll().
    then(([products, fieldData]) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    }).catch(err => { console.log(err); });
};

exports.deleteProduct = (req, res, next) => {
  const id = req.body.id;
  Product.delete(id);
  Product.getProductWithId(id, (prod) => {
    Cart.delete(id, prod.price);
  })
  res.redirect('/products');
}
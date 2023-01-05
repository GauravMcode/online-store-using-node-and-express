const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  });
};

exports.getProductDetails = (req, res, next) => {
  const prodId = req.params.productID;
  // console.log(prodId);
  Product.getProductWithId(prodId, (prod) => {
    res.render('shop/product-detail', {
      product: prod,
      pageTitle: `Details`,
      path: '/products'
    });
  });
}

exports.getIndex = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  });
};

exports.postAddtoCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.getProductWithId(prodId, (product) => {
    Cart.fetchCart((cart) => {
      console.log(cart.length);
      if (cart.totalPrice) {   //if cart has atleast 1 object
        const cartItem = cart.products.find((c) => c.id === product.id);
        const index = cart.products.findIndex((prod) => prod.id === prodId);
        console.log(index);
        if (cartItem) {
          var totalPrice = parseFloat(cart.totalPrice);
          cart.products[index].qty += 1;
          totalPrice += parseFloat(product.price);
          const cartData = new Cart(cart.products, totalPrice);
          cartData.save();
        } else {
          cart.products.push({ id: prodId, qty: 1 });
          cart.totalPrice += parseFloat(product.price);
          const cartData = new Cart(cart.products, parseFloat(cart.totalPrice));
          cartData.save();
        }
      }
      else {
        cart.products = [{ id: prodId, qty: 1 }];
        cart.totalPrice = parseFloat(product.price);
        const cartData = new Cart(cart.products, cart.totalPrice);
        cartData.save();
      }

    });
  })
  //todo : implement adding the (prodId and qty in product and totalprice ) in cart


  res.redirect('/products');
}

exports.getCart = (req, res, next) => {
  Cart.fetchCart((cart) => {
    Product.fetchAll((products) => {
      const productsList = [];
      for (const prod of cart.products) {
        productsList.push(products.find((p) => p.id === prod.id));
      }
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: productsList,
        cart: cart,
      });
    })
  });
};

exports.deleteCartItem = (req, res, next) => {
  const id = req.body.id;
  console.log(id);
  Product.getProductWithId(id, (prod) => {
    Cart.delete(id, prod.price, () => {
      res.redirect('/cart');
    });
  })
}

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};

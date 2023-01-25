const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');   //pdfkit exposes a pdf document constructor

const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');


error500 = (err, next) => {
  const error = new Error(err);
  error.httpStatusCode = 500;
  return next(error);
}


exports.getProducts = (req, res, next) => {
  Product.find()   //method provided by the mongoose to fetch all the products from the database
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProductDetails = (req, res, next) => {
  const prodId = req.params.productID;
  Product.findById(prodId) //findById is the mongoose method,Also  we can even pass a string to find by id and mongoose will automatically convert this to an object ID,
    .then((product) => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      error500(err, next);
    });
}

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAddtoCart = (req, res, next) => {
  const prodId = req.body.productId;

  req.session.user = new User().init(req.session.user); //makes the data object to user model object
  req.session.user.addToCart(prodId)
    .then(result => {
      res.redirect('/cart')
      // console.log(result);
    })
    .catch(err => {
      error500(err, next);
    })
}

exports.getCart = (req, res, next) => {
  req.session.user = new User().init(req.session.user);
  req.session.user
    .populate('cart.items.productId')  //to populate productId with Product Objects
    // .execPopulate()  //as populate doesn't returns a promise, to use then on it, we use execPopulate() here
    .then((user) => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
      });
    })
    .catch(err => { console.log(err); });

};

exports.deleteCartItem = (req, res, next) => {
  const id = req.body.id;
  req.session.user = new User().init(req.session.user);
  req.session.user.deleteCartItem(id)
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => {
      error500(err, next);
    })

}

exports.postCreateOrder = (req, res, next) => {
  console.log('creating order.........');
  req.session.user = new User().init(req.session.user);
  req.session.user
    .populate('cart.items.productId')
    .then((user) => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } } //with ._doc we get access to just the data that's in there and not the meta-data
      });
      const order = new Order({
        products: products,
        user: {
          // name: req.session.user.name,
          userId: req.session.user._id
        }
      })
      order.save();
    })
    .then(result => {
      req.session.user.clearCart();
    })
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => {
      error500(err, next);
    })
}

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.session.user._id })
    .then((orders) => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
      });
    })
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout',
  });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if (order.user.userId.toString() !== req.session.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      //setting up pdf and piping
      const pdfDoc = new PDFDocument();  //creates a new pdf document, which is also a readable stream
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=${invoiceName}`);
      pdfDoc.pipe(fs.createWriteStream(invoicePath)); //piping from readable stream to writable stream (saves into server)
      pdfDoc.pipe(res); //piping from readable stream to writable stream (serves to client)

      //writing to pdf
      pdfDoc.fontSize(25).text('INVOICE', { align: 'center' });
      pdfDoc.fontSize(20).text('*********************************************************');
      pdfDoc.lineGap(2);
      let toatalPrice = 0;
      order.products.forEach(prod => {
        toatalPrice += prod.product.price * prod.quantity
        pdfDoc.lineGap(10);
        pdfDoc.fontSize(16).text(`${prod.product.title}, qty : ${prod.quantity}`);
        pdfDoc.fontSize(16).text(`Price: $${prod.product.price * prod.quantity}`);
        pdfDoc.lineGap(10);
      });
      pdfDoc.lineGap(10);
      pdfDoc.fontSize(20).text('*********************************************************');
      pdfDoc.fontSize(22).text(`Total Price : $${toatalPrice}`, { align: 'center' });


      //end writing to pdf
      pdfDoc.end(); //done writing. thus, the file will be saved and response will be sent

      //reading stream instead of storing it completely in memory
      //the stream data as soon as read(i.e. each  chunk) is piped to writable stream i.e. response 
    })
    .catch(err => next(err));
}

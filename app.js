const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const mongoclient = require('./util/database').mongoclient;

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const User = require('./models/user');


app.use((req, res, next) => {
    User.findById('63c163db08fae179f9523fad')
        .then((user => {
            req.user = new User(user.username, user.email, user.cart, user._id);
            console.log(user);
            next();
        }))
        .catch(err => console.log(err));
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoclient(() => {
    app.listen(3000);
});




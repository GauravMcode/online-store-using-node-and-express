const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongodbStore = require('connect-mongodb-session')(session);  //this function execution returns a constructor function
const csrf = require('csurf');
const flash = require('connect-flash');


const errorController = require('./controllers/error');


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://gaurav:fireup@cluster0.cwp7tik.mongodb.net/shop?retryWrites=true&w=majority'

const store = MongodbStore({
    uri: MONGODB_URI,
    collection: 'sessions'
})

const protectedToken = csrf();


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({ secret: 'some secret hashed value', resave: false, saveUninitialized: false, store: store })
)

app.use(protectedToken);
app.use(flash());  //now we can access the flash from anywhere in our application in the req object

app.use((req, res, next) => {  //these variables are passed to all the views
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})

/*the csrf token is added to session as well as passed as cookie to views along with form. now, 
when we received next req i.e. the post request. the token in session is matched with the one we
received. It ensures that post req is given only to views rendered by us/ */

app.use(authRoutes);
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((errors, req, res, next) => {
    res.redirect('/500')
}) //special error handling midddleware

mongoose.connect(MONGODB_URI)
    .then(result => {
        app.listen(3000);
    })
    .catch(err => console.log(err))




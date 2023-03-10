const path = require('path');
// const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongodbStore = require('connect-mongodb-session')(session);  //this function execution returns a constructor function
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const compressible = require('compressible'); //(optional) : just for seeing file type
const morgan = require('morgan') //for logging user req data


const errorController = require('./controllers/error');


const app = express();

// console.log(compressible("text/html")); //to check if a mimtype is compressible or not

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const User = require('./models/user');

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.cwp7tik.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`

const store = MongodbStore({
    uri: MONGODB_URI,
    collection: 'sessions'
})

const protectedToken = csrf();

const fileStorage = multer.diskStorage({   //returns a storage engine with destiantion and filename configuration
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().getTime() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {  //to filter files for only of specific types
    if (
        file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'
    ) {
        cb(null, true);    //the file is accepted
    } else {
        console.log('file isn\'t of right format ');
        cb(null, false);  //the file is rejected
    }
}

// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' }) //{flags : a} means that log data will be appended and not overriden

app.use(helmet({ crossOriginEmbedderPolicy: false }))  //adds various headers to each response to set secure response headers
app.use(compression())  //compresses assets i.e. css js files for faster loading
// app.use(morgan("combined", { stream: accessLogStream }))
app.use(
    helmet.contentSecurityPolicy({ //to set the CSP to enable access to script src of stripe
        directives: {
            'default-src': ["'self'"],
            'script-src': ["'self'", "'unsafe-inline'", 'https://js.stripe.com/v3/'],
            // 'script-src-elem': ["'self'", 'js.stripe.com'],
            'style-src': ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
            'frame-src': ["'self'", 'js.stripe.com'],
            'font-src': ["'self'", 'fonts.googleapis.com', 'fonts.gstatic.com']
        },
    })
)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))  //returns a middleware that looks for multipart/form-data encoded form 
app.use(express.static(path.join(__dirname, 'public'))); //to statically server public folder
app.use(express.static(path.join(__dirname, 'images'))); //to statically server images folder :
// It will bring file inside the images folder as if it is  in root folder

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

//special error handling midddleware 
app.use((errors, req, res, next) => {
    console.log(errors);
    if (!req.session) {
        return res.redirect('/500');
    }
    res.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    });
})

mongoose.set('strictQuery', false)
mongoose.connect(MONGODB_URI)
    .then(result => {
        app.listen(process.env.PORT || 3000);
    })
    .catch(err => {
        console.log(err)
    })




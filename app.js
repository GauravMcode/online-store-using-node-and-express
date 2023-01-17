const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongodbStore = require('connect-mongodb-session')(session);  //this function execution returns a constructor function


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



// app.use((req, res, next) => {
//     User.findById('63c2a40543bab386fba97b21')
//         .then((user => {
//             req.session.user = user;
//             // console.log(user);
//             next();
//         }))
//         .catch(err => console.log(err));
// });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({ secret: 'some secret hashed value', resave: false, saveUninitialized: false, store: store })
)

app.use(authRoutes);

// app.use((req, res, next) => {
//     if (!req.session.user) {
//         res.redirect('/login');
//     } else {
//         next();
//     }
// });


app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect(MONGODB_URI)
    .then(result => {
        app.listen(3000);
    })
    .catch(err => console.log(err))




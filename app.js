const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const errorController = require('./controllers/error');


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const User = require('./models/user');


app.use((req, res, next) => {
    User.findById('63c2a40543bab386fba97b21')
        .then((user => {
            req.user = user;
            // console.log(user);
            next();
        }))
        .catch(err => console.log(err));
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect('mongodb+srv://gaurav:fireup@cluster0.cwp7tik.mongodb.net/shop?retryWrites=true&w=majority')
    .then(result => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User(
                    {
                        name: "Gaurav",
                        email: 'gaurav@test.com',
                        cart: {
                            items: []
                        }
                    }
                )
                user.save();
            }
        })

        app.listen(3000);
    })
    .catch(err => console.log(err))




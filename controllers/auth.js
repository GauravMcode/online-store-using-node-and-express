const bcryptjs = require('bcryptjs');

const User = require("../models/user");


exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: req.flash('error')[0] //as it returns an array  of messages, so if no message it will return undefined
    })
}
exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid email or password');
                return res.redirect('/login')
            }
            bcryptjs.compare(password, user.password)
                .then(isMatched => {
                    if (isMatched) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {  //as above statements write to mongodb which would take some time so we save and pass cb
                            console.log(err);
                            res.redirect('/')
                        });
                    }
                    req.flash('error', 'Invalid email or password');
                    res.redirect('/login')
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
}
exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/')
    });
}

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'SignUp',
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: req.flash('error')[0]
    })
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    User.find({ email: email })
        .then(userDoc => {
            console.log(password != confirmPassword);
            if (userDoc[0]) {
                req.flash('error', 'Email already exists');
                return res.redirect('/signup')
            }
            else if (password != confirmPassword) {
                console.log('2');
                req.flash('error', 'password and confirm-password doesn\'t match ');
                return res.redirect('/signup')
            }
            return bcryptjs.hash(password, 12)
                .then(encryptedPassword => {
                    const user = new User({ email: email, password: encryptedPassword, cart: { items: [] } });
                    user.save();
                })
                .then(result => {
                    res.redirect('/login')
                })
        })
        .catch(err => console.log(err));
}

exports.isAuth = (req, res, next) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }
};
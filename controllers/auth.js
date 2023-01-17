const User = require("../models/user");


exports.getLogin = (req, res, next) => {
    console.log(req.session);
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: req.session.isLoggedIn
    })
}
exports.postLogin = (req, res, next) => {

    User.findById('63c5a3770ba89a1df72d747d')
        .then(user => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save(err => {  //as above statements write to mongodb which would take some time so we save and pass cb
                console.log(err);
                res.redirect('/')
            });
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
        isAuthenticated: req.session.isLoggedIn
    })
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    User.find({ email: email })
        .then(userDoc => {
            if (userDoc) {
                res.redirect('/signup')
            }
            const user = new User({ email: email, password: password, cart: { items: [] } });
            user.save();
        })
        .then(result => {
            res.redirect('/login')
        })
        .catch(err => console.log(err));
}
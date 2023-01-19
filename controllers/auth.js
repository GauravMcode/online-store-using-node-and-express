const crypto = require('crypto');

const bcryptjs = require('bcryptjs');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator/check');

const User = require("../models/user");
const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mishrajiratlam532@gmail.com',
        pass: 'mjczzjhaeejckwhk'
    }
})


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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            isAuthenticated: req.session.isLoggedIn,
            errorMessage: errors.array()[0].msg
        })
    }
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
    const errors = validationResult(req);
    console.log(errors.array());
    if (!errors.isEmpty()) {
        //422 : error status code to indicate that the validation failed; along with that it will render the signup page
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'SignUp',
            isAuthenticated: req.session.isLoggedIn,
            errorMessage: errors.array()[0].msg
        })
    }
    User.find({ email: email })

    //todo : psswd and confirm psswd check has alredy been done in validation
    // else if (password != confirmPassword) {
    //     console.log('2');
    //     req.flash('error', 'password and confirm-password doesn\'t match ');
    //     return res.redirect('/signup')
    // }
    bcryptjs.hash(password, 12)
        .then(encryptedPassword => {
            const user = new User({ email: email, password: encryptedPassword, cart: { items: [] } });
            user.save();
        })
        .then(result => {
            res.redirect('/login');
            return transport.sendMail({
                to: email,
                from: 'mishrajiratlam532@gmail.com',
                subject: 'Signup Successfull!',
                html: '<h1>Welcome to Node products shop. Your Signup was successfull</h1>'
            })
        })
        .catch(err => console.log(err))
}

exports.isAuth = (req, res, next) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }
};

exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: req.flash('error')[0]
    })
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {  //generatin 32 bytes hex value to be used as token 
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex')  //converts buffer with hexadecimal values to string with ASCII characters
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No user with this email found.');
                    res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000  //3600000 miliseconds implies 1 hour
                return user.save();
            })
            .then(result => {
                res.redirect('/');
                transport.sendMail({
                    to: req.body.email,
                    from: 'mishrajiratlam532@gmail.com',
                    subject: 'Signup Successfull!',
                    html: `
                    <p>You requested a Password Reset</p>
                    <p>Click on this <a href="http://localhost:3000/reset/${token}">link</a>  to reset the password</p>
                    `
                })
            })
            .catch(err => { console.log(err) })
    })
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                req.flash('error', 'No user found or link expired.');
                res.redirect('/reset');
            }
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                isAuthenticated: req.session.isLoggedIn,
                errorMessage: req.flash('error')[0],
                userId: user._id.toString(),
                token: token
            })
        })
        .catch(err => console.log(err))
}

exports.postNewPassword = (req, res, next) => {
    const userId = req.body.userId;
    const updatedPassword = req.body.password;
    const token = req.body.token;
    let reqUser;

    User.findOne({ userId: userId, resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                return res.redirect('/reset');
            }
            reqUser = user;
            return bcryptjs.hash(updatedPassword, 12)
        })
        .then(hashedPassword => {
            reqUser.password = hashedPassword;
            reqUser.resetToken = undefined;
            reqUser.resetTokenExpiration = undefined;
            return reqUser.save();
        })
        .then(result => {
            res.redirect('/login')
        })
        .catch(err => console.log(err))
}
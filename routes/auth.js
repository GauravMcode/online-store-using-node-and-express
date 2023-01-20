const express = require('express');
const router = express.Router();

const { check, body } = require('express-validator/check');
const User = require('../models/user');
//import only check function from the express-validator  object
//body function will only check in the body for that field

const authController = require('./../controllers/auth');

router.get('/login', authController.getLogin);
router.post('/login',
    body('email', 'Please enter a valid email').isEmail(),
    body('password', 'The password should contain atleast 5 characters with only alphabets and numbers').isLength({ min: 5 }).isAlphanumeric(),
    authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);
router.post('/signup',

    //1 : check email
    check('email')
        .isEmail()
        .withMessage('Please enter a correct email')
        .custom((value, { req }) => {
            // if (value === 'test1@test.com') {
            //     throw new Error('This email is blocked');
            // }
            // return true;
            return User.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email already exists');
                        //Promise.reject(): with reject, we basically throw an error inside of the promise.
                        //custom validator here looks if true, or error or promise is returned. In this case promise, which in turn 
                        //returns reject containing the error message, which in turn is percieved by validtor as error with error message 
                    }
                })
        })
        .trim()
        .normalizeEmail(),

    //2 : check password
    check('password', 'The password should contain atleast 5 characters with only alphabets and numbers')  //second argument: default error msg
        .isLength({ min: 5 })  //minimun length of the value is 5
        .isAlphanumeric()
        .trim(),  //checks if the value is text or numbers only

    //3 : check confirmPassword === password
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Confirm password should be equal to password');
            }
            return true;
        })
        .trim(),

    authController.postSignup);

/*we can apply as many middlewares for a path as we want
validation on the post req, if there is error it is attached to the request : check() checks for email in params, body, cookies etc
withMessage is used to customize the error message*/

router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
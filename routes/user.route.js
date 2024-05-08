const passport = require('passport');
const userController = require('../controller/user.controller');
const express = require('express');
const { check } = require('express-validator');
const { isAuthentication } = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/signup', userController.signup);
router.post('/signupverify', userController.signupverify);
router.post('/resendotp', userController.signupresendotp);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotpassword)
router.post('/reset-password', userController.resetpassword)
router.post('/logout', isAuthentication, userController.logout);
router.get('/profile', isAuthentication, userController.userProfile);
router.put('/profile', isAuthentication, userController.updateUserProfile);




router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), userController.googleLogin);



router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), userController.facebookLogin);

module.exports = router;

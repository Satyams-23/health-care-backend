const passport = require('passport');
const userController = require('../controller/userController');
const express = require('express');
const router = express.Router();

router.post('/signup', userController.signup);
router.post('/signupverify', userController.signupverify);
router.post('/resendotp', userController.signupresendotp);
router.post('/login', userController.login);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), userController.googleLogin);



router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), userController.facebookLogin);

module.exports = router;

const passport = require('passport');
const express = require('express');

passport.use(require('./strategy'));

const router = new express.Router();

router.get('/', require('../../../../utils/scopeQueryToHeader'), passport.authenticate('google'));

router.get('/callback', passport.authenticate('google', {
    failureRedirect: '/v1/oauth/google/failure-callback',
    successRedirect: '/v1/oauth/google/success-callback',
    failureMessage: true,
}));
router.get('/success-callback', require('./success-callback/get'));
router.get('/failure-callback', require('./failure-callback/get'));

module.exports = router;

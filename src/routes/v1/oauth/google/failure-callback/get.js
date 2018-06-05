const qs = require('qs');

const {
    thirdParty: {
        google: {
            callbackURLThirdParty,
        },
    },
} = require('../../../../../config');

// eslint-disable-next-line no-unused-vars
module.exports = async (req, res, next) => {
    const failureMessage = req.session.messages && req.session.messages.length ? req.session.messages[0] : 'Something went wrong';
    const queryString = qs.stringify({
        failure_message: failureMessage,
    });

    res.redirect(`${callbackURLThirdParty}?${queryString}`);
};

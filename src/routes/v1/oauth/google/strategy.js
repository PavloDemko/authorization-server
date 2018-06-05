const co = require('co');
const _ = require('lodash');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const {
    thirdParty: {
        google: config,
    },
} = require('../../../../config');

const logger = require('../../../../utils/logger');
const UserConnectionPromise = require('../../../../models/user');

module.exports = new GoogleStrategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL,
    scope: ['profile', 'email']
}, (accessToken, refreshToken, profile, cb) => {
    co(function * () {
        const data = (profile && profile._json) || {};
        const {
            emails,
            name: {
                familyName: firstName,
                givenName: lastName,
            },
            id,
        } = data;

        let user;

        const email = emails.length ? emails.filter(email => email.type === 'account')[0].value : '';

        try {
            const UserCollection = yield UserConnectionPromise;
            const query = {
                email,
            };
            const update = {
                $set: {
                    email,
                    'social.googleId': id,
                    'meta.firstName': firstName,
                    'meta.lastName': lastName,
                    version: 1,
                },
            };
            const options = {
                returnOriginal: false,
            };

            const result = yield UserCollection.findOneAndUpdate(query, update, options);

            if (!result.value) {
                return cb(null, false, { message : 'User Not Found' })
            }

            const meta = _.get(result, 'value.meta');

            user = {
                firstName: meta.firstName,
                lastName: meta.lastName,
                email,
                user_id: _.get(result, 'value._id'),
            };
        } catch (error) {
            logger.error('Error occurred during authorization using Google strategy', error);

            cb(error);
        }

        cb(null, user);
    });
});

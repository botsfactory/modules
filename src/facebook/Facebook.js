const { ThreadSettings } = require('./ThreadSettings')
const { FacebookApi } = require('./FacebookApi');
const async = require('async');
const rollbar = require('rollbar');
const mongoose = require('mongoose');
const _ = require('lodash');

class Facebook {

    constructor({ bot, server, config }) {
        this.bot = bot;
        this.server = server;
        this.config = config;

        this.executeThreadSettings();
        this.installApi();
        this.installMiddlewares();
    }

    executeThreadSettings() {

        const threadSettings = new ThreadSettings(this.config.FACEBOOK_PAGE_TOKEN);

        if (this.config.greetingText) {
            threadSettings.greeting(this.config.greetingText);
        }

        if (this.config.menu) {
            threadSettings.menu(this.config.menu)
        }

        if (this.config.getStarted) {
            threadSettings.get_started(this.config.getStarted)
        }
    }

    installApi() {

        this.server.post('/api/refreshFacebookProfile/', (req, res, next) => {

            const query = req.body.query || {};
            const User = mongoose.model('user');

            User.find(query).exec().toArray().then(users => {

                if (users.length) {
                    var startTime = new Date();
                    async.eachLimit(users, 10, (user, next) => {

                        const duration = Math.abs((new Date().getTime() - startTime.getTime()) / 1000);
                        res.write(`Executed refreshFacebookProfile for connieId: ${user.connieId}, Duration: ${duration} seconds\n`);
                        console.log(`Executed refreshFacebookProfile for connieId: ${user.connieId}, Duration: ${duration} seconds`);

                        if (user.addresses && user.addresses.facebook) {
                            //Call Facebook API to refresh "facebookPageScopedProfile" node
                            this.refreshProfile(user.addresses.facebook, user).then(() => {
                                next();
                            });
                        }
                        else {
                            next();
                        }
                    },
                        () => {

                            res.write(`Finished Execution of all users. Duration: ${Math.abs((new Date().getTime() - startTime.getTime()) / 1000)} seconds\n`);
                            res.end();
                        }
                    );
                }
                else {

                    res.write(`No user found that match the query ${JSON.stringify(query)} \n`);
                    res.end();
                }
            });
        });
    }

    installMiddlewares() {

        this.bot.use(
            {
                receive: (event, next) => {

                    if (event.source == 'facebook') {

                        switch (event.sourceEvent.message.sticker_id) {
                            case 369239263222822:
                            case 369239343222814:
                            case 369239383222810:

                                // adding the text property makes the event be interpreted as a normal message
                                event.text = ':like:'
                                break;
                        }
                    }

                    next()
                }
            })

        this.bot.use(
            {
                botbuilder: (session, next) => {

                    const fb = new FacebookApi({ token: this.config.FACEBOOK_PAGE_TOKEN });
                    const user = session.message.user;
                    const address = session.message.address;

                    if (!user.facebookPageScopedProfile && address.channelId == 'facebook' && !user.blocked) {

                        return fb.getProfile(address.user.id).then((data) => {

                            if (!('error' in data)) {

                                user.facebookPageScopedProfile = data;
                                user.firstName = data.first_name;
                                user.lastName = data.last_name;
                                user.name = `${data.first_name} ${data.last_name}`; //override name value with the real data from facebook
                                user.locale = this.getLocaleFromPageScopedProfile(data);

                                user.save().then(() => next())

                            } else {

                                if (data.error.error_subcode == 2018001) { //"No matching user" means user blocked the bot

                                    user.blocked = true;
                                    rollbar.info(data.error, null, { user: { id: user.connieId, username: user.name } });
                                    console.log(`<User blocked>: connieId: ${user.connieId}, user.name: ${user.name}`);

                                    return user.save().then(() => { next() })
                                }
                                else {
                                    rollbar.error(data.error, null, { user: { id: user.connieId, username: user.name } });

                                    next();
                                }
                            }
                        })
                    }
                    else {

                        next();
                    }
                }
            })

        this.bot.use(
            {
                botbuilder: (session, next) => {

                    const user = session.message.user;
                    const address = session.message.address;

                    if (user.locale === 'default' && user.facebookPageScopedProfile && address.channelId == 'facebook') {

                        user.locale = this.getLocaleFromPageScopedProfile(user.facebookPageScopedProfile);
                        user.save().then(() => next())

                    } else {

                        next();
                    }
                }
            })
    }

    getLocaleFromPageScopedProfile(data) {

        const fblocale = data.locale.split('_')[0];

        if (_.includes(['es', 'en'], fblocale)) {

            return fblocale;
        }
        else {

            return 'en';
        }
    }

    refreshProfile(address, user) {

        const fb = new FacebookApi({ token: this.config.FACEBOOK_PAGE_TOKEN });

        return fb.getProfile(address.user.id).then((data) => {
            if (!('error' in data)) {

                const User = mongoose.model('user');
                return User.findByAddress(address).then(user => {
                    user.facebookPageScopedProfile = data;
                    user.firstName = data.first_name;
                    user.lastName = data.last_name;
                    user.name = `${data.first_name} ${data.last_name}`; //override name value with the real data from facebook
                    user.locale = this.getLocaleFromPageScopedProfile(data);

                    return user.save();
                });

            } else {

                if (data.error.error_subcode != 2018001) { //"No matching user" means user blocked the bot
                    rollbar.error(data.error.message, null, { user: { id: user.connieId, username: user.name } });
                }

                return;
            }
        })
    }
}

module.exports.Facebook = Facebook;
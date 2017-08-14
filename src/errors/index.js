const { User } = require('../users');
const Rollbar = require('rollbar');

class IRollbarReporterConfig {

    constructor({ token, environment }) {

        this.token = token;
        this.environment = environment;
    }
}

module.exports.installRollbarReporter = (bot, config) => {

    let originalSessionErrorHandler;

    const rollbar = Rollbar.init({
        accessToken: config.token,
        handleUncaughtExceptions: true,
        handleUnhandledRejections: true,
        environment: config.environment
    });

    bot.use
        ({
            botbuilder: (session, next) => {

                if (!originalSessionErrorHandler) {
                    originalSessionErrorHandler = session.error;
                }

                session.error = (err) => {

                    let user = session.message.user;

                    rollbar.handleErrorWithPayloadData(
                        err,
                        null,
                        {
                            custom:
                            {
                                message: session.message.text,
                                channel: session.message.address.channelId,
                                id: session.message.address.user.id,
                                sourceEvent: JSON.stringify(session.message.sourceEvent),
                                user:
                                {
                                    id: user.connieId,
                                    username: user.name
                                }
                            }
                        });

                    // call botframework's original handler
                    return originalSessionErrorHandler.call(session, err);
                };

                next();
            }
        });
}
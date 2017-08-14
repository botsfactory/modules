const { DashbotAnalytics } = require('./DashbotAnalytics');

module.exports.install = (bot, DASHBOT_API_KEY) => {

    const analytics = new DashbotAnalytics(DASHBOT_API_KEY)

    // Install logging middleware
    bot.use({
        send: (event, next) => {

            if (event.type == 'message') {
                analytics.track(event.address.user.id, event.text, 'outgoing', Date.now())
            }

            next()
        },
        receive: (event, next) => {

            if (event.type == 'message') {
                analytics.track(event.user.id, event.text, 'incoming', Date.now())
            }

            next()
        }
    });
}
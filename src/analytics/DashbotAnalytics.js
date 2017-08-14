
const request = require('request')
const dashbot = require('dashbot')(process.env.DASHBOT_API_KEY).facebook;

class DashbotAnalytics {

    constructor(DASHBOT_API_KEY) {
        this.DASHBOT_API_KEY = DASHBOT_API_KEY
    }

    //SEE: https://www.dashbot.io/sdk/generic
    track(userId, text, origin, eventTimestamp) {
        request({
            url: `https://tracker.dashbot.io/track?platform=generic&v=0.7.4-rest&type=${origin}&apiKey=${this.DASHBOT_API_KEY}&eventTimestamp=${eventTimestamp}`,
            body: JSON.stringify(
                {
                    "text": text,
                    "userId": userId
                }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, function (error, response, body) {

            if (error) {
                console.error("Error sending data to dashbot", error)
            }
        });
    }
}

module.exports.DashbotAnalytics = DashbotAnalytics;

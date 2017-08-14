const request = require('request');

class ThreadSettings {

    constructor(FACEBOOK_PAGE_TOKEN) {

        if (!FACEBOOK_PAGE_TOKEN) {

            console.error("MISSING FACEBOOK_PAGE_TOKEN ", FACEBOOK_PAGE_TOKEN);
        }

        this.FACEBOOK_PAGE_TOKEN = FACEBOOK_PAGE_TOKEN;
    }

    greeting(greeting) {
        var message = {
            greeting
        };

        this.postAPI(message);
    }

    get_started(payload) {
        var message = {
            get_started: {
                payload
            }
        };

        this.postAPI(message);
    }

    menu(payload) {
        var message = {
            persistent_menu: payload
        };

        this.postAPI(message);
    }

    postAPI(message) {

        const url = `https://graph.facebook.com/v2.6/me/messenger_profile?access_token=${this.FACEBOOK_PAGE_TOKEN}`

        request.post(url,
            {
                form: message
            },
            function (err, res, body) {
                if (err) {
                    console.log('Could not configure thread settings');
                } else {

                    var results = null;
                    try {
                        results = JSON.parse(body);
                    } catch (err) {
                        console.log('ERROR in messenger profile API call: Could not parse JSON', err, body);
                    }

                    if (results) {
                        if (results.error) {
                            console.log('ERROR in messenger profile API call: ', results.error.message);
                        } else {
                            console.log('Successfully configured messenger profile', body);
                        }
                    }

                }
            });
    }

    deleteAPI(message) {

        const url = `https://graph.facebook.com/v2.6/me/messenger_profile?access_token=${this.FACEBOOK_PAGE_TOKEN}`

        request.delete(url,
            { form: message },
            function (err, res, body) {
                if (err) {
                    console.log('Could not configure thread settings');
                } else {
                    console.log('Successfully configured thread settings', message);
                }
            });
    }
}

module.exports.ThreadSettings = ThreadSettings;
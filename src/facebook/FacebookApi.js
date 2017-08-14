const fetch = require('node-fetch');
const rollbar = require('rollbar');
const mongoose = require('mongoose');

class FacebookApi {

    constructor({ token, apiUrl = 'https://graph.facebook.com/v2.8' }) {
        this.token = token
        this.api = apiUrl
    }

    getProfile(id) {

        const url = `${this.api}/${id}?access_token=${this.token}`

        return fetch(url)
            .then(response => {
                return response.json()
            })
    }
}

module.exports.FacebookApi = FacebookApi;
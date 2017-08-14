#!/usr/bin/env node
const _ = require('lodash');
const fs = require('fs');

const json = require('./horoscobot-es.json');


const utterances = json.utterances
    // .filter(u => u.intent == 'GetHoroscope')
    .map(u => {

        if (u.intent == 'GetOwnHoroscope') {
            u.intent = 'getHoroscope';
        }

        if (u.intent == 'Thankfull') {
            u.intent = 'thankful'
        }

        u.text = u.text.replace(/\,/ig, ' ')

        if (u.intent != 'None') {

            return `${u.text}, ${u.intent.charAt(0).toLowerCase() + u.intent.slice(1)}`
        }
    });

const file = fs.createWriteStream('./utterances.csv', { encoding: 'utf-8' });

file.on('error', (err) => {
    console.log('shit')
});

utterances.forEach(u => {

    if (u) {
        file.write(u + '\n');
    }
});

file.end();
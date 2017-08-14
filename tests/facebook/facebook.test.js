
const { TestConnector } = require('../TestConnector');
const { Facebook, FacebookApi } = require('../../src/facebook');
const { Users } = require('../../src/users');
const builder = require('botbuilder');
const express = require('express');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const supertest = require('supertest');
const { DefaultUserSchema } = require('../../src/users')


let mockedPageScopedProfile = {};

jest.mock('../../src/facebook/FacebookApi', (cb) => {

    class FacebookApi {

        getProfile() {

            return Promise.resolve(mockedPageScopedProfile);
        }
    }

    return { FacebookApi }
});

const User = mongoose.model('User', DefaultUserSchema)

describe("Facebook", () => {

    let connector;
    let dialog;
    let bot;
    let server;

    beforeAll(done => {

        mongoose.connect('mongodb://localhost:27017/horoscobot-test', { useMongoClient: true });

        User.remove({})
            .then(() => {
                return User.create(
                    {
                        addresses: { facebook: { user: { id: 'existing-no-locale' } } }
                    },
                )
            })
            .then(() => {

                done();
            })
    })

    afterAll(() => {

        return mongoose.disconnect();
    })

    beforeEach(() => {

        connector = new TestConnector();
        server = express();

        bot = new builder.UniversalBot(connector);
        dialog = jest.fn();

        dialog.mockImplementation((session) => {

            session.endDialog(session.message.text);
        })

        bot.dialog('/', dialog);

        new Users({ bot, server, schema: DefaultUserSchema, transformUser: (user) => user, uri: 'mongodb://localhost:27017/horoscobot-test' });
        new Facebook({ bot: bot, server: server, config: { FACEBOOK_PAGE_TOKEN: 'abc' } });
    })


    it("Set [es] locale for new user", (done) => {

        mockedPageScopedProfile = { locale: 'es_UY' };

        connector.send = (messages, callback) => {

            const session = dialog.mock.calls[0][0];

            expect(session.message.user.locale).toEqual('es');
            done();
        }

        connector.receiveMessage(new builder.Message()
            .address({ channelId: 'facebook', user: { id: 'new [es] user' }, conversation: {} })
            .timestamp()
            .text('hola'))
    });

    it("Set default locale for new user with unsuported locale", (done) => {

        mockedPageScopedProfile = { locale: 'ru_RU' };

        connector.send = (messages, callback) => {

            const session = dialog.mock.calls[0][0];

            expect(session.message.user.locale).toEqual('en');
            done();
        }

        connector.receiveMessage(new builder.Message()
            .address({ channelId: 'facebook', user: { id: 'new [ru] user' }, conversation: {} })
            .timestamp()
            .text('hola'))
    });

    it('Set [es] locale for existing user with no locale set', (done) => {

        mockedPageScopedProfile = { locale: 'es_LA' };

        connector.send = (messages, callback) => {

            const session = dialog.mock.calls[0][0];

            expect(session.message.user.locale).toEqual('es');
            done();
        }

        connector.receiveMessage(new builder.Message()
            .address({ channelId: 'facebook', user: { id: 'existing-no-locale' }, conversation: {} })
            .timestamp()
            .text('hola'))
    });
})
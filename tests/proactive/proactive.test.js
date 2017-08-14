const cmproactive = require('../../src/proactive');
const { Proactive } = require('../../src/proactive');
const builder = require('botbuilder');
const express = require('express');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const supertest = require('supertest');
const { DefaultUserSchema } = require('../../src/users')

const User = mongoose.model('User', DefaultUserSchema)

const mocks = {
    server: () => {

        const server = express();
        return server;
    },
    bot: () => {

        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);

        bot.__proactive = jest.fn();

        bot.dialog('/proactive', bot.__proactive);

        return bot;
    }
}

describe("Proactive", () => {

    let bot = mocks.bot();
    let server = mocks.server();
    let instance = new Proactive({ bot: bot, server: server, db: {} });

    beforeAll(done => {

        mongoose.connect('mongodb://localhost:27017/horoscobot-test')
            .then(() => {

                User.remove({})
                    .then(() => {

                        return User.create
                            ({
                                connieId: 'test',
                                name: 'John Doe',
                                addresses: { facebook: {}, emulator: {} },
                                blocked: false,
                                locale: 'en',
                                custom: {}
                            })
                    })
                    .then(() => {

                        done();
                    })
            })
    })

    beforeEach(() => {

        bot = mocks.bot();
        server = mocks.server();

        instance = new Proactive({ bot: bot, server: server, db: mongoose.connection.db });
        instance.install();
    })

    it("Should return a 404 for an unknown proactive api handler", (done) => {

        supertest(server).post('/api/proactive/notadded')
            .end((err, res) => {
                expect(res.status).toBe(404);
                expect(res.body.text).toBe(`Proactive handler [notadded] not found`);
                done();
            })
    });

    it("Should sexecute a proactive handler", (done) => {

        const handler = jest.fn((bot, user, logger, next, args) => {

            next();
        });

        instance.add({ id: 'test', query: {}, handler });

        supertest(server).post('/api/proactive/test')
            .end((err, res) => {

                expect(handler).toHaveBeenCalled();

                done();
            })
    })
})
const builder = require('botbuilder');
const request = require('request');
const fs = require('fs');
const moment = require('moment');
const async = require('async');
const path = require('path');
const { ProactiveLogger } = require('./ProactiveLogger');

class Proactive {

    constructor({ bot, db, server }) {

        this.bot = bot;
        this.server = server;
        this.db = db
        this.handlers = {};
    }

    _sendProactives(handlerId, args, users, res) {
        var startTime = new Date();
        async.eachLimit(users, 10, (user, next) => {

            const duration = Math.abs((new Date().getTime() - startTime.getTime()) / 1000);
            res.write(`Executed proactive handler for ${user.connieId}, Duration: ${duration} seconds\n`);
            console.log(`Executed proactive handler for connieId: ${user.connieId}, Duration: ${duration} seconds`);

            this.handlers[handlerId].callback(this.bot, user, this.handlers[handlerId].logger, next, args);

        },
            () => {
                const duration = Math.abs((new Date().getTime() - startTime.getTime()) / 1000);
                console.log(`Finished Execution of all users. Duration: ${duration} seconds`)
                res.write(`Finished Execution of all users (${users.length}). Duration: ${duration} seconds\n`);
                res.end();
            }
        );
    }

    install() {

        this.server.post('/api/proactive/:id', (req, res, next) => {

            const id = req.params.id;

            if (id in this.handlers) {

                // handle empty req body
                req.body = req.body || {}

                const handler = this.handlers[id];
                const query = req.body.query || handler.query || {};
                let aggregate = req.body.aggregate || handler.aggregate || '';
                const args = req.body.args || {}

                res.write(`Starting execution of proactive handler [${id}]\n`);

                // using AGGREGATE
                if (aggregate != '') {
                    aggregate = aggregate.replace('#hour', moment.utc().hours().toString());

                    const aggregateObj = JSON.parse(aggregate);

                    this.db.collection('users').aggregate(aggregateObj, (err, result) => {
                        if (result.length) {
                            this._sendProactives(id, args, result, res);
                        }
                        else {

                            res.write(`No user found that match the aggregate ${JSON.stringify(aggregateObj)} \n`);
                            res.end();
                        }

                    });
                }
                else { //using FIND

                    this.db.collection('users').find(query).toArray().then(users => {

                        if (users.length) {
                            this._sendProactives(id, args, users, res);
                        }
                        else {

                            res.write(`No user found that match the query ${JSON.stringify(query)} \n`);
                            res.end();
                        }
                    });
                }
            }
            else {
                res.status(404).json({ text: `Proactive handler [${id}] not found` }).end()
            }

            next()
        })
    }

    add({ id, query, aggregate = '', handler }) {

        this.handlers[id] = { logger: new ProactiveLogger(id, this.db), query: query || {}, aggregate: aggregate || '', callback: handler };
        console.log(`Added proactive handler in: /api/proactive/[${id}]`);
    }

    addDefaultProactives() {

        this.add
            ({
                id: 'sendmessage',
                query: {},
                handler: (bot, user, logger, next, args) => {

                    const address = user.addresses[args.channelId]

                    const message = new builder.Message()
                        .text(args.text)
                        .address(address)

                    this.bot.send(message, (err) => {

                        if (err) {

                            console.error('ERROR sending message to ', address.user.name, address.user.id);
                            console.error(err);
                        }
                        else {

                            console.info('Succesfully send message to ', address.user.name, address.user.id);
                        }

                        logger.log({ data: { errror: err ? err : null } })

                        next()
                    })
                }
            });


        this.add
            ({
                id: 'begindialog',
                query: {},
                handler: (bot, user, logger, next, args) => {

                    const address = user.addresses[args.body.channelId]

                    this.bot.beginDialog(address, args.body.dialogId, args.body.dialogArgs, (err) => {

                        if (err) {
                            console.error('ERROR begining dialog to', address.user.name)
                        }
                        else {
                            console.info('Succesfully begun dialog to', address.user.name)
                        }
                        next()
                    })
                }
            })
    }

    addPageLike(config = { pageUrl: '', imageUrl: '', title: '', subtitle: '', webviewTitle: '', facebookPageToken: '', facebookAppId: '' }) {

        this.bot.dialog('/pageLike', [

            (session, args, next) => {
                const user = session.message.user;
                const pageLikeUrl = `https://${args.host}/api/webviews/pageLike`;

                /** add URL to whitelisted_domains */
                request.post({
                    url: 'https://graph.facebook.com/v2.9/me/messenger_profile?access_token=' + config.facebookPageToken,
                    form: { whitelisted_domains: [pageLikeUrl] }
                }, (err, httpResponse, body) => {

                });

                let msg = new builder.Message(session);
                msg.sourceEvent({
                    facebook: {

                        attachment: {
                            type: 'template',
                            payload: {
                                template_type: 'generic',
                                elements: [
                                    {
                                        title: session.localizer.gettext(user.locale, config.title),
                                        image_url: config.imageUrl,
                                        subtitle: session.localizer.gettext(user.locale, config.subtitle),
                                        buttons: [
                                            {
                                                type: "web_url",
                                                url: pageLikeUrl,
                                                title: session.localizer.gettext(user.locale, 'Me gusta'),
                                                webview_height_ratio: "compact"
                                            }
                                        ]
                                    }
                                ]
                            }
                        }

                    }
                });

                session.endConversation(msg);
            }
        ]);

        this.add({
            id: 'pageLike',
            query: {},
            handler: (bot, user, logger, next, args) => {

                let facebookAddress = user.addresses['facebook'];
                if (facebookAddress) {
                    logger.exists({ 'data.facebookId': facebookAddress.user.id }).then(exists => {
                        if (exists) {
                            console.log('Already send page like to', facebookAddress.user.id, facebookAddress.user.name);
                            next();
                        }
                        else {
                            try {

                                bot.beginDialog(facebookAddress, '/pageLike', { host: args.host }, err => {
                                    if (err) {
                                        console.error('Error sending message sent to', facebookAddress.user.id, facebookAddress.user.name);
                                        logger.log({ data: { facebookId: facebookAddress.user.id, error: err } });
                                        next();
                                    }
                                    else {
                                        console.log('Message sent to', facebookAddress.user.id, facebookAddress.user.name);
                                        logger.log({ data: { facebookId: facebookAddress.user.id } });
                                        next();
                                    }
                                });

                            }
                            catch (e) {
                                console.log(`Error sending message to ${facebookAddress.user.id} ${facebookAddress.user.name}: ${e.message}`);
                                next();
                            }
                        }
                    });
                }
                else {
                    next();
                }
            }
        });

        //add GET to webview page
        this.server.get('/api/webviews/pageLike', function (req, res) {

            fs.readFile(path.join(__dirname, '../../public/webviews/pageLike/index.html'), 'utf8', function (err, data) {

                let html = data.replace(new RegExp('{pageUrl}', 'g'), config.pageUrl);
                html = html.replace(new RegExp('{appId}', 'g'), config.facebookAppId);
                html = html.replace(new RegExp('{webviewTitle}', 'g'), config.webviewTitle);
                res.send(html);
            });
        });
    }

}

module.exports.Proactive = Proactive;
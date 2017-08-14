
//@ts-check
const rollbar = require('rollbar');
const uuid = require('uuid/v1');
const mongoose = require('mongoose');

class Users {

    constructor({ uri, server, bot, schema, transformUser }) {

        this.config = { server, bot, transformUser }

        mongoose.connect(uri);

        schema.statics.findByAddress = function (address) {

            const query = {};

            query[`addresses.${address.channelId}.user.id`] = address.user.id;

            return this.findOne(query).exec();
        }

        schema.pre('save', function (next) {

            this.updated = Date.now();
            next();
        })

        this.model = mongoose.model('user', schema);


        bot.set('lookupUser', (address, done) => {

            this.lookupUser(address, done);
        })
    }


    createIfNotExists(address) {

        return this.model.findByAddress(address)

            .then(user => {

                if (user) {

                    return { user, address };
                }
                else {

                    const newUser = new this.model({
                        connieId: uuid(),
                        name: address.user.name,
                        id: address.user.id,
                        addresses: { [address.channelId]: address }
                    })

                    return newUser.save().then(user => {

                        return { user, address };
                    })
                }
            })
    }

    transformUser({ user, address }) {

        return (this.config.transformUser) ? { user: this.config.transformUser(user), address: address } : { user, address };
    }

    lookupUser(address, done) {

        return this.createIfNotExists(address)
            .then(this.transformUser.bind(this))
            .then(({ user, address }) => {

                done(null, user)
            })
            .catch((error) => {

                done(error, address.user)
            })
    }


}


module.exports.Users = Users;
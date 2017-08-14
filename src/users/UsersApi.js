
class UsersApi {

    constructor(db) {

        this.collection = db.collection('users')
    }

    getById(connieId) {

        return this.collection.find({ connieId: connieId }).limit(1).next()
    }

    getByAddress(address) {

        let query = {}

        query[`addresses.${address.channelId}.user.id`] = address.user.id

        return this.collection.find(query).limit(1).next().then(user => {

            //TODO: this should be done using mongoose
            user.custom = {};

            return user;
        })
    }

    getAll() {
        return this.collection.find().toArray()
    }

    update(connieId, update) {

        return this.collection.updateOne({ connieId }, update)
    }
}

module.exports.UsersApi = UsersApi;
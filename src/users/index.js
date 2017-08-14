const { Users } = require('./Users');
const { UsersApi } = require('./UsersApi')
const { DefaultUserSchema } = require('./DefaultUserSchema')

module.exports.install = (bot, db, uri, server, schema, { transformUser }) => {

    const users = new Users({ bot, uri, server, schema, transformUser });

    return users;
}

module.exports.UsersApi = UsersApi;
module.exports.Users = Users;
module.exports.DefaultUserSchema = DefaultUserSchema;
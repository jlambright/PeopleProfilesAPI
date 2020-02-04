const {Sequelize, Model, DataTypes, DbHandler} = require('../index');
const AuthData = require('./authData');

class UserData extends Model {
}

UserData.init({
    id: {type: DataTypes.UUIDV4, primaryKey: true},
    username: {type: DataTypes.STRING, primaryKey: true},
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    full_name: DataTypes.STRING,
    company: DataTypes.STRING,
    email: DataTypes.STRING,
    title: DataTypes.STRING,
    years_of_experience: DataTypes.INTEGER
}, {sequelize: DbHandler, modelName: 'profile', timestamps: true});

UserData.Auth = UserData.hasOne(AuthData);
AuthData.associate(UserData);

// This is a class method, it is not called on an individual
// user object, but rather the class as a whole.
// e.g. UserData.authenticate('user1', 'password1234')
UserData.authenticate = async function (username, authMethod, credential) {
    const user = await UserData.findOne({
        where: {
            'username': username
        }
    });

    const auth = user.AuthData;

    if (authMethod === "password") {
        if (auth.passwordAuthorization(credential)) {
            return user.authorize();
        } else {
            throw new Error('invalid password');
        }
    } else if (authMethod === "token") {
        if (auth.tokenAuthorization(credential)) {
            return user.authorize();
        } else {
            throw new Error('invalid auth token');
        }
    }

};

UserData.prototype.authorize = async function () {
    const user = this;
    const {auth} = user;

    const token = await auth.newAuthToken();

    return {user, token};
};

UserData.prototype.logout = async function (token) {
    // destroy the auth token record that matches the passed token
    const user = this;
    const {auth} = user;

    if (auth.tokenAuthorization(token)) {
        auth.deleteAuthToken();
    } else {
        throw new Error('invalid auth token');
    }
};

module.exports = UserData;
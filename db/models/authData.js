const {Sequelize, Model, DataTypes, DbHandler} = require('../index');
const crypto = require('crypto');


class AuthData extends Model {
}

AuthData.init({
    id: {type: DataTypes.UUIDV4, primaryKey: true},
    token: {
        type: DataTypes.STRING,
        get() {
            return () => this.getDataValue('token')
        }
    },
    password: {
        type: DataTypes.STRING,
        get() {
            return () => this.getDataValue('password')
        }
    },
    pw_salt: {
        type: Sequelize.STRING,
        get() {
            return () => this.getDataValue('pw_salt')
        }
    },
    tk_salt: {
        type: Sequelize.STRING,
        get() {
            return () => this.getDataValue('tk_salt')
        }
    }
}, {sequelize: DbHandler, timestamps: true});

AuthData.associate = function ({UserData}) {
    AuthData.User = AuthData.belongsTo(UserData);
};

AuthData.encryptCredential = function (plainText, salt) {
    return crypto
        .createHash('RSA-SHA256')
        .update(plainText)
        .update(salt)
        .digest('hex')
};

AuthData.generateSalt = function () {
    return crypto.randomBytes(16).toString('base64')
};

// generates a random 15 character token
const generateToken = (auth) => {

    let token = '';

    const possibleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
        'abcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 15; i++) {
        token += possibleCharacters.charAt(
            Math.floor(Math.random() * possibleCharacters.length)
        );
    }
    auth.token = token;
};

const setSaltPasswordAndToken = auth => {
    if (auth.changed('password')) {
        auth.pw_salt = AuthData.generateSalt();
        auth.password = AuthData.encryptCredential(auth.password(), auth.pw_salt());
    }
    if (auth.changed('token')) {
        auth.tk_salt = AuthData.generateSalt();
        auth.password = AuthData.encryptCredential(auth.password(), auth.tk_salt());
    }
};

AuthData.beforeCreate(setSaltPasswordAndToken);
AuthData.beforeUpdate(setSaltPasswordAndToken);

AuthData.prototype.passwordAuthorization = function (enteredPassword) {
    return AuthData.encryptCredential(enteredPassword, this.pw_salt()) === this.password()
};

AuthData.prototype.tokenAuthorization = function (providedAccessToken) {
    return AuthData.encryptCredential(providedAccessToken, this.tk_salt()) === this.token()
};

AuthData.prototype.deleteAuthToken = function () {
    const auth = this;
    auth.token = null;
};

AuthData.prototype.newAuthToken = function () {
    const auth = this;
    generateToken(auth);
    return auth.token;
};

module.exports = AuthData;
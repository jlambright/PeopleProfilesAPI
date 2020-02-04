const {Joi} = require('celebrate');

// General Schemas
const authTokenSchema = Joi.string().token();

const passwordSchema = Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required();

// accepts a valid UUID v4 string as id
const personIdSchema = Joi.string().guid({version: 'uuidv4'});

const userNameSchema = Joi.string().alphanum().min(3).max(30);

const AUTH_SCHEMA = Joi.object().keys({
    token: authTokenSchema,
    id: personIdSchema,
    username: userNameSchema,
    password: passwordSchema,
    confirm_password: Joi.ref('password')
})
    .xor('id', 'username')
    .xor('token', 'password')
    .and('password', 'confirm_password')
    .without('token', ['password', 'confirm_password']);

// Exports
module.exports.basicAuthSchemas = {
    token: authTokenSchema,
    username: userNameSchema,
    password: passwordSchema,
    person_id: personIdSchema
};

module.exports.authRouteSchema = AUTH_SCHEMA;

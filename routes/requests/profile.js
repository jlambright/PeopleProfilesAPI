const {Joi} = require('celebrate');

const {basicAuthSchemas, authRouteSchema} = require('./auth');


// accepts string only as letters and converts to uppercase
const standardizedString = Joi.string().min(1).uppercase().required();

const yearsOfExperience = Joi.number().integer().greater(0).required();

const personDataSchema = Joi.object().keys({
  username: basicAuthSchemas.username.required(),
  first_name: standardizedString,
  last_name: standardizedString,
  full_name: Joi.string().regex(/^[A-Z]+ [A-Z]+$/i).uppercase(),
  company: standardizedString,
  current_company: standardizedString,
  email: Joi.string().email({tlds: {deny: ['ru', 'cn']}}).required(),
  title: Joi.string().min(1).required(),
  years_of_experience: yearsOfExperience,
  yoe: yearsOfExperience
})
    // must have only one between current_company and company
    .xor('current_company', 'company')

    // must have only one between years_of_experience and yoe
    .xor('years_of_experience', 'yoe')

    // must have only one between firstname and lastname
    .xor('firstname', 'fullname')

    // firstname and lastname must always appear together
    .and('firstname', 'lastname')

    // firstname and lastname cannot appear together with fullname
    .without('fullname', ['firstname', 'lastname']);


const DELETE_SCHEMA = Joi.object().keys({
  auth: authRouteSchema.required(),
  username: basicAuthSchemas.username.required()
});

const GET_SCHEMA = Joi.object().keys({
  auth: authRouteSchema.required(),
  username: basicAuthSchemas.username.required()
});

const PUT_SCHEMA = Joi.object().keys({
  auth: authRouteSchema.required(),
  username: basicAuthSchemas.username,
  person_data: personDataSchema.required()
});

const POST_SCHEMA = Joi.object().keys({
  auth: authRouteSchema.required(),
  person_data: personDataSchema.required(),
});


module.exports = {
  '/create': POST_SCHEMA,
  '/delete': DELETE_SCHEMA,
  '/edit': PUT_SCHEMA,
  '/search': GET_SCHEMA
};

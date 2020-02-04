const {Sequelize, Model, DataTypes} = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:'); //PostgreSQL for production use.

module.exports = {
    Sequelize,
    Model,
    DataTypes,
    sequelize
};
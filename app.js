const createError = require('http-errors');
const express = require('express');
const BodyParser = require('body-parser');
const {errors} = require('celebrate');

const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const router = require('./routes');

const app = express();
app.use(BodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(errors());

module.exports = app;

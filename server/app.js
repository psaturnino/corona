var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var csvDataRouter = require('./routes/csvdata');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(function(req, res, next) {
  //console.log(req.get("referer"))
  const allowedOrigins = [
    'http://corona.localhost/',
    'http://localhost:5000/',
    'http://localhost:19006/',
    'https://www.sars-cov-2-chart.com/',
    'https://sars-cov-2-chart.com/',
  ]
  
  if (req.get("referer")) {
    const req_url = req.get("referer").split("?")
    const index = allowedOrigins.indexOf(req_url[0])
    
    if(index > -1) res.setHeader('Access-Control-Allow-Origin', allowedOrigins[index].slice(0, -1));
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  }
  next();
});

app.use('/', indexRouter);
app.use('/csvdata', csvDataRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

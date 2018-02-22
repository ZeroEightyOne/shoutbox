var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const session = require('express-session');
//
// Routes
//
//var index = require('./routes/index');
const entries = require('./routes/entries');
const register = require('./routes/register');
const login = require('./routes/login');
//
// Middleware
//
const validate = require('./middleware/validate');
const messages = require('./middleware/messages');
const user = require('./middleware/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('dev'));
app.use(bodyParser.json());

    //  Since we use input names like 'entry[]'
    //
    //eg.
    //<input type="text" name="entry[title]" placeholder="Title" />
    //<textarea name="entry[body]" placeholder="Body"></textarea>
    //
    //we need extended: true
    //This allows us to do:
    //
    //const data = req.body.entry
    //let title = data[title]
    //let body = data[body]

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({secret: 'secret', resave: false, saveUnitialized: true})); //place after cookie middleware
app.use(express.static(path.join(__dirname, 'public')));

app.use(messages); //Now can access messages and removeMessages from any template
app.use(user); //Now every res.locals and req will have a populated user object if subscriber is authenticated



app.get('/', entries.list);
app.get('/post',entries.form);
app.post('/post', validate.required('entry[title'), validate.lengthAbove('entry[title',4), entries.submit);
app.get('/register',register.form);
app.post('/register',register.submit);
app.get('/login',login.form);
app.post('/login',login.submit);
app.get('/logout',login.logout);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

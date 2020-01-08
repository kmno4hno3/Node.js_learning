//モジュールのロード
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
//var createError = require('http-errors');

//ルーティングの設定
var index = require('./routes/index');
var login = require('./routes/login');
var add = require('./routes/add');
var mark = require('./routes/mark');

var app = express();

// view engine setup(エンジンの設定)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//ミドルウェア関数の設定
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var session_opt = {
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000}
};
app.use(session(session_opt));

//ルーティングファイルの設定
app.use('/login', login);   //ログインページ
app.use('/add', add);       //マークダウン登録ページ
app.use('/mark', mark);     //マークダウン表示・更新ページ
app.use('/', index);        //トップページ 

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

//モジュールのロード
var createError = require('http-errors');     //Expressnエラーに関する
var express = require('express');             //Express本体
var path = require('path');                   //ファイルパス本体
var cookieParser = require('cookie-parser');  //HTTPリクエストのログ出力に関する
var logger = require('morgan');               //クッキーのパース(値変換処理)に関する
var session = require('express-session');


//ルート用スクリプトのロード
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var hello = require('./routes/hello');
var ajax = require('./routes/ajax');

//Expressのオブジェクトを作成し、基本設定を行う
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));    //テンプレートファイル保管場所の設定
app.set('view engine', 'ejs');                      //テンプレートエンジンの種類の設定

//アプリケーション作成に必要な処理の組み込み(読み込んだモジュールの機能を呼び出す)
app.use(logger('dev'));
app.use(express.json());                            //Body ParserでJSONエンコーディングをONにする
app.use(express.urlencoded({ extended: false }));   //Body ParserでURLエンコーディングをONにする
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/ajax', ajax);                 //requireでロードしたajax.jsを/ajaxに割り当てる


var session_opt = {
  secret: 'keyboard cat',               //秘密キーとなるテキスト、ハッシュと呼ばれる計算する時のキーとなる(デフォルトはkeyboard catだがそれぞれ書き換える)
  resave: false,                        //セッションストアに強制的に値を保存
  saveUninitialized: false,             //初期化されていない値を強制的に保存
  cookie: { maxAge: 60 * 60 * 1000 }    //セッションIDを保管するクッキーに関する設定(ここでは、maxAgeという値でクッキーの保管時間を1時間に設定)
};
app.use(session(session_opt));

//アクセスのためのapp.use作成(特定のアドレスにアクセスした時の処理)
//第一引数に割り当てるパスを指定、第二引数に関数
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/hello', hello);

//エラー発生時の処理
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

//exports:外部からのアクセスに関数、これによりオブジェクトが外部からアクセスできるようになる
module.exports = app;

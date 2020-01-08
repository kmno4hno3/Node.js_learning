//モジュールのロード
var express = require('express');             //Express本体
var path = require('path');                   //ファイルパスを扱うためのモジュール
var logger = require('morgan');               //HTTPリクエストのログ出力に関するモジュール
var cookieParser = require('cookie-parser');  //クッキーのパース(値を変換する処理)に関するモジュール
var bodyParser = require('body-parser');      //フォーム送信データ変換に関するモジュール
var session = require('express-session');     //セッションに関するモジュール
//var validator = require('express-validator');

//ルート用スクリプトのロード
var index = require('./routes/index');    
var users = require('./routes/users');
var home = require('./routes/home');


var app = express();        //アプリケーションオブジェクトの作成(Expressアプリケーション本体)

// view engine setup(app.set：アプリケーションで必要とする各種の設定情報をセットする)
app.set('views', path.join(__dirname, 'views'));      //テンプレートファイルが保管されている場所
app.set('view engine', 'ejs');                        //テンプレートファイルの種類


//全てのwebページにアクセス(リクエスト送信時)した際の基本的な処理が行われるように設定(ミドルウェア関数)↓
app.use(logger('dev'));
app.use(bodyParser.json());                                 //jsonエンコーディングをON
app.use(bodyParser.urlencoded({ extended: false}));         //URLエンコーディングをON(URLエンコードされたボディを返す、送信されたformの内容が変換されて取り出せる)
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));    //引数に指定したパス内のファイルを静的ファイルとして利用する(cssなど)
//app.use(validator());

//セッションのオプション設定
var session_opt = {
  secret: 'keyboard cat',   //秘密キーのテキスト(セッションIDなどで「ハッシュ」と呼ばれる計算をするときのキー)
  resave: false,            //セッションストアに強制的に値を保存するため
  saveUninitialized: false, //初期化されていない値を強制的に保存するため
  cookie: {maxAge: 60 * 60 * 1000}    //セッションIDを保管するクッキーに関する設定(maxAge:クッキーの保管時間を1時間に設定)
};

app.use(session(session_opt));
//↑ここまでがミドルウェア関数の設定


//特定のアドレスにアクセスした際の処理を設定
app.use('/users', users);
app.use('/', index);
app.use('/home', home);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => { 
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

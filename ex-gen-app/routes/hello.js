var express = require('express');
var router = express.Router();
var mysql = require('mysql');       //MySQLモジュールのロード

var mysql_setting =  {              //MySQLにアクセスする際に必要となる設定情報を変数にまとめている
    host        : 'localhost',         //MySQLサーバーがあるホスト名
    user        : 'root',              //DBへのアクセスに用いるユーザー名(デフォルト)
    password    : '',                  //アクセス時に用いるパスワード(デフォルト)
    database    : 'my-nodeapp-db'      //利用するDB名
};

router.get('/', (req, res, next) => {      //ここはhello下の「/」になる(/hello/)
    
    //コネクションの用意
    var connection = mysql.createConnection(mysql_setting);     //コネクションを用意(DB接続を管理するオブジェクト、引数にはDBに関する設定情報を指定)

    //データベースに接続
    connection.connect();               //connectメソッド:コネクションで指定したDBサーバーに接続を開始

    //データを取り出す
    connection.query('SELECT * from mydata',          //queryメソッド:「クエリー」という命令(SQL言語)をDBサーバーに送信し、結果を受け取る
            function (error, results, fields) {       //error:発生したエラー情報をまとめたもの、results:クエリー実行して得られた値、fields:取り出したフィールドに関する情報をまとめたもの
            //データベースアクセス完了時の処理
            if(error == null) {
                var data = {title: 'mysql', content: results};
                res.render('hello', data);
            }
    });

    //接続を解除
    connection.end();       //DBアクセスを終了
});

module.exports = router;
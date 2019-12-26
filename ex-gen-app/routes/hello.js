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
                res.render('hello/index', data);
            }
    });

    //接続を解除
    connection.end();       //DBアクセスを終了
});

router.get('/add', (req, res, next) => {
    var data = {
        title:      'Hello/Add',
        content:    '新しいレコードを入力:'
    }
    res.render('hello/add', data);
});

//新規作成フォーム送信の処理
router.post('/add', (req, res, next) => {
    var nm = req.body.name;                 //送信されてきたフォームの値を変数に取り出す
    var ml = req.body.mail;
    var ag = req.body.age;
    var data = {'name':nm, 'mail':ml, 'age':ag};        //ひとまとめにして変数dataに用意

    //データベースの設定情報(コネクションの作成)
    var connection = mysql.createConnection(mysql_setting);

    //データベースに接続
    connection.connect();

    //クエリー文の実行
    connection.query('insert into mydata set ?', data,  //第1引数:実行するSQL文(プレースホルダ(値の場所を予約))、第2引数:値(?のところにはめ込まれる)、
            function(err, results, fields) {
                res.redirect('/hello');                 //  /helloにリダイレクトする、redirect():引数に指定したアドレスにリダイレクトする
    });

    //接続を解除
    connection.end();
})

//指定IDのレコードを表示する
router.get('/show', (req, res, next) => {
    var id = req.query.id;

    //データベースの設定情報
    var connection = mysql.createConnection(mysql_setting);

    //データベースに接続
    connection.connect();

    //データを取り出す
    connection.query('SELECT * from mydata where id=?', id,     //where 条件
    function(error, results, fields) {
        //データベースアクセス完了時の処理
        if(error == null) {
            var data = {
                title:     'Hello/show',
                content:   'id = ' + id + '　のレコード:' ,
                mydata:     results[0]                      //select文を実行した結果はレコードの配列になっているので、最初のレコードだけを渡す
            }
            res.render('hello/show', data);
        }
    });

    //接続を解除
    connection.end();

});

//指定レコードを編集
router.get('/edit', (req, res, next) => {
    var id = req.query.id;

    //データベースの設定情報
    var connection = mysql.createConnection(mysql_setting);

    //データベースに接続
    connection.connect();

    //データを取り出す
    connection.query('SELECT * from mydata where id=?', id, 
            function(error, results, fields) {
                //データベースアクセス完了時の処理
                if(error == null) {
                    var data = {
                        title:      'Hello/edit',
                        content:    'id = ' + id + '　のレコード：',
                        mydata:     results[0]
                    }
                    res.render('hello/edit', data);
                }
            });

            //接続を解除
            connection.end();
});

//編集フォーム送信の処理
router.post('/edit', (req, res, next) => {
    var id = req.body.id;
    var nm = req.body.name;
    var ml = req.body.mail;
    var ag = req.body.age;
    var data = {'name': nm, 'mail':ml, 'age':ag};

    //データベースの設定情報
    var connection = mysql.createConnection(mysql_setting);

    //データベースに接続
    connection.connect();

    //データを取り出す
    connection.query('update mydata set ? where id = ?',        //送信したレコードの内容を元に更新処理
            [data, id], function(error, results, fields){
                res.redirect('/hello');
    });
    
    //接続を解除
    connection.end();
});

module.exports = router;
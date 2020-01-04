var express = require('express');
var router = express.Router();
var mysql = require('mysql');       //MySQLモジュールのロード
var knex = require('knex')({        //knexモジュールのロード    require('knex')(設定のオブジェクト)　→　requireでロードしたオブジェクトの関数を実行するということをまとめて行っている
    client: 'mysql',                        //DBの指定
    connection: {                           //DBに関する設定情報をまとめたもの
            host        : 'localhost',          //DBサーバーの指定
            user        : 'root',               //ユーザー名
            password    : '',                   //パスワード
            database    : 'my-nodeapp-db',      //DB名
            charset     : 'utf8'                //使用する文字コード
    }
});
var Bookshelf = require('bookshelf')(knex);  //Bookshelfをロード、後ろの()でknexオブジェクトを関数として指定して実行

var MyData = Bookshelf.Model.extend({       //モデルの作成、データベースにあるテーブルを扱うためのオブジェクト、Model.extendメソッドで行う
    tableName:  'mydata'                    //extendの引数にはモデルに関する設定をまとめたオブジェクトを用意
});

const { check, validationResult } = require('express-validator');       //Express Validatorモジュールをロード

var mysql_setting =  {              //MySQLにアクセスする際に必要となる設定情報を変数にまとめている
    host        : 'localhost',         //MySQLサーバーがあるホスト名
    user        : 'root',              //DBへのアクセスに用いるユーザー名(デフォルト)
    password    : '',                  //アクセス時に用いるパスワード(デフォルト)
    database    : 'my-nodeapp-db'      //利用するDB名
};


router.get('/', (req, res, next) => {      //ここはhello下の「/」になる(/hello/)
    new MyData().fetchAll().then((collection) => {      //fetchall：全てのレコード取得、then：DBアクセス完了後の処理をコールバック関数として設定
                                                        //collection：DBから取り出されたレコードデータをまとめたもの、ただし「Basemodel」オブジェクトの配列になっているので注意
        //取得できた場合の処理
        var data = {
                    title:  'Hello!',
                    content:    collection.toArray()
                };
                res.render('hello/index', data);
    })
        //エラー発生時の処理
    .catch((err) => {
        res.status(500).json({error: true, data: {message:      //res.status(500).json(...)：statusメソッドとjsonメソッドを続けて実行している
            err.message}});                                     //statusメソッド：引数のステータスコードを送る(500は内部エラー)、jsonメソッド：引数の情報をJSONデータとして出力
    });
});

//新規作成ページへのアクセス
router.get('/add', (req, res, next) => {
    var data = {
        title:      'Hello/Add',
        content:    '新しいレコードを入力:',
        form:       {name: '', mail: '', age: 0}
    }
    res.render('hello/add', data);
});

//新規作成フォーム送信の処理
router.post('/add', (req, res, next) => {
    var response = res;
    new MyData(req.body).save().then((model) => {       //MyData()：引数にreq.bodyを指定し送信されたフォームの値をMyDataの値として設定、save()：MyDataオブジェクトをテーブルに保存
        response.redirect('/hello');                    //thenを使わないと保存される前にredirectされてしまう
    });
});

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



//指定レコードを削除
router.get('/delete', (req, res, next) => {
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
                        title:      'Hello/delete',
                        content:    'id = ' + id + '　のレコード：',
                        mydata:     results[0]
                    }
                    res.render('hello/delete', data);
                }
            });

            //接続を解除
            connection.end();
});

//削除フォームの送信処理
router.post('/delete', (req, res, next) => {
  var id = req.body.id;
  
  //データベースの設定情報
  var connection = mysql.createConnection(mysql_setting);

  //データベースに接続
  connection.connect();

  //データを取り出す
  connection.query('delete from mydata where id = ?',
            id, function(error, results, fields) {
                res.redirect('/hello');
            });

    //接続を解除
    connection.end();
})



module.exports = router;
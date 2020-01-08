var express = require('express');
var router = express.Router();

var mysql = require('mysql'); //★追加

// ★以下を追加
var knex = require('knex')({
    dialect: 'mysql',
    connection: {
		host     : 'localhost',
		user     : 'root',
		password : '',
		database : 'my-nodeapp-db',
		charset  : 'utf8'
      }
});

var Bookshelf = require('bookshelf')(knex);

var MyData = Bookshelf.Model.extend({
    tableName: 'mydata'
});
// ここまで


var mysql_setting = {
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'my-nodeapp-db'
};

// ★以下は、既にあるメソッドを書き換える
// GETアクセスの処理
router.get('/', (req, res, next) => {
    new MyData().fetchAll().then((collection) => {
        var data = {
                    title: 'Hello!',
                    content: collection.toArray()
                };
                res.render('hello/index', data);
   })
   .catch((err) => {
        res.status(500).json({error: true, data: {message: err.message}});
   });
});


// 新規作成ページへのアクセス
router.get('/add', (req, res, next) => {
    var data = {
        title: 'Hello/Add',
        content: '新しいレコードを入力：',
        form: {name:'', mail:'', age:0}
    }
    res.render('hello/add', data);
});

// Bookshelf版
// 新規作成フォームの送信処理
router.post('/add', (req, res, next) => {
    var response = res;
    new MyData(req.body).save().then((model) => {
        response.redirect('/hello');
    });
});

// Bookshelf版検索
router.get('/find', (req, res, next) => {
    var data = {
        title: '/Hello/Find',
        content: '検索IDを入力：',
        form: {fstr:''},
        mydata: null
    };
    res.render('hello/find', data);
});

router.post('/find', (req, res, next) => {
    new MyData().where('id', '=', req.body.fstr).fetch()
            .then((collection) => {
        var data = {
            title: 'Hello!',
            content: '※id = ' + req.body.fstr + ' の検索結果：',
            form: req.body,
            mydata:　collection
        };
        res.render('hello/find', data);
    })
});



// 指定IDのレコードを表示する
router.get('/show', (req, res, next) => {
    var id = req.query.id;

    // データベースの設定情報
    var connection = mysql.createConnection(mysql_setting);

    // データベースに接続
    connection.connect();

    // データを取り出す
    connection.query('SELECT * from mydata where id=?', id,
            function (error, results, fields) {
        // データベースアクセス完了時の処理
        if (error == null) {
            var data = {
                title: 'Hello/show',
                content: 'id = ' + id + ' のレコード：',
                mydata: results[0]
            }
            res.render('hello/show', data);
        }
    });

    // 接続を解除
    connection.end();
});

// 指定レコードを編集
router.get('/edit', (req, res, next) => {
    var id = req.query.id;

    // データベースの設定情報
    var connection = mysql.createConnection(mysql_setting);

    // データベースに接続
    connection.connect();

    // データを取り出す
    connection.query('SELECT * from mydata where id=?', id,
            function (error, results, fields) {
        // データベースアクセス完了時の処理
        if (error == null) {
            var data = {
                title: 'Hello/edit',
                content: 'id = ' + id + ' のレコード：',
                mydata: results[0]
            }
            res.render('hello/edit', data);
        }
    });

    // 接続を解除
    connection.end();
});

// 編集フォーム送信の処理
router.post('/edit', (req, res, next) => {
    var id = req.body.id;
    var nm = req.body.name;
    var ml = req.body.mail;
    var ag = req.body.age;
    var data = {'name':nm, 'mail':ml, 'age':ag};

    // データベースの設定情報
    var connection = mysql.createConnection(mysql_setting);

    // データベースに接続
    connection.connect();

    // データを取り出す
    connection.query('update mydata set ? where id = ?', 
            [data, id], function (error, results, fields) {
        res.redirect('/hello');
    });

    // 接続を解除
    connection.end();
});

// 指定レコードを削除
router.get('/delete', (req, res, next) => {
    var id = req.query.id;

    // データベースの設定情報
    var connection = mysql.createConnection(mysql_setting);

    // データベースに接続
    connection.connect();

    // データを取り出す
    connection.query('SELECT * from mydata where id=?', id,
            function (error, results, fields) {
        // データベースアクセス完了時の処理
        if (error == null) {
            var data = {
                title: 'Hello/delete',
                content: 'id = ' + id + ' のレコード：',
                mydata: results[0]
            }
            res.render('hello/delete', data);
        }
    });

    // 接続を解除
    connection.end();
});

// 削除フォームの送信処理
router.post('/delete', (req, res, next) => {
    var id = req.body.id;

    // データベースの設定情報
    var connection = mysql.createConnection(mysql_setting);

    // データベースに接続
    connection.connect();

    // データを取り出す
    connection.query('delete from mydata where id=?', 
            id, function (error, results, fields) {
        res.redirect('/hello');
    });

    // 接続を解除
    connection.end();
});


// Paginationプラグイン
Bookshelf.plugin('pagination'); //★fetchPage追加

// ページネーション表示
router.get('/:page', (req, res, next) => {
    var pg = req.params.page;
    pg *= 1;
    if (pg < 1){ pg = 1; }
    new MyData().fetchPage({page:pg, pageSize:3}).then((collection) => {
        var data = {
            title: 'Hello!',
            content: collection.toArray(),
            pagination:collection.pagination
        };
        console.log(collection.pagination);
        res.render('hello/index', data);
   })
   .catch((err) => {
        res.status(500).json({error: true, data: {message: err.message}});
   });
});


module.exports = router;

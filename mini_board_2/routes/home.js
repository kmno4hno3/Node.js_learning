//モジュールのロード
var express = require('express');       //Express本体
var router = express.Router();          //ルーティング
var mysql = require('mysql');           //mysql
var knex = require('knex')({            //knex
    client: 'mysql',
    connection: {
                host:       'localhost',
                user:       'root',
                password:   '',
                database:   'my-nodeapp-db',
                charset:    'utf8'
    }
});
var Bookshelf = require('bookshelf')(knex);


//モデルオブジェクトの生成
var User = Bookshelf.Model.extend({         //Userモデル
    tableName:      'users'
});

var Message = Bookshelf.Model.extend({      //Messageモデル
    tableName:  'messages',
    hasTimestamps:     true,
    user:       function(){
        return this.belongsTo(User);            //belongsTo:アソシエーション(2つのテーブルのレコードを関連づける)、別のテーブルのレコードを一緒に取り出す
    }
});


//ルーティング
    //ホームページにアクセス
router.get('/', (req, res, next) => {
    res.redirect('/');
});

    //
router.get('/:id', (req, res, next) => {
    res.redirect('/home/' + req.params.id + '/1');
});

router.get('/:id/:page', (req, res, next) => {
    var id = req.params.id;     //:idパラメーターの値がparamsに入っているので.idで取り出せる
    id *= 1;                        //1未満だったら、1にしている
    var pg = req.params.page;   //:pageパラメーターの値がparamsに入っている.pageで取り出せる
    pg *= 1;
    if(pg < 1){ pg = 1; }
    new Message().orderBy('created_at', 'DESC')
        .where('user_id', '=', id)                                      //whereメソッドで絞り込み、(項目名, 比較する記号 , 値)
        .fetchPage({page: pg, pageSize: 10, withRelated: ['user']})     //fetchAllのページネーション版、page:現在のページ番号, pageSize:1ページあたりのレコード数
        .then((collection) => {
            var data = {
                title:      'miniBoard',
                login:      req.session.login,
                user_id:    id,
                collection: collection.toArray(),
                pagination: collection.pagination       //collectionにページネーションに関するプロパティが追加される
            };
            res.render('home', data);
        }).catch((err) => {
            res.status(500).json({error: true, data: {message: err.message}});
        });
});

module.exports = router;


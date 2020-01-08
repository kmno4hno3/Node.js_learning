var express = require('express');   
var router = express.Router();      //Routerオブジェクトの生成(ルーティングに関する機能)

var mysql = express('mysql');

//knexモジュールをロードして、knexの関数を実行するということをまとめて行っている
var knex = require('knex')({
  client: 'mysql',       //使用するDBの指定
  connection: {          //DBに関する設定情報をまとめたもの
              host      :'localhost',       //DBサーバーの指定
              user      :'root',            //アクセスに使うユーザー名
              password  :'',                //アクセスに使うパスワード
              database  :'my-nodeapp-db',   //アクセスに使うDB名
              charset   :'utf8'             //使用する文字コード
  }
});

//bookshlefモジュールをロードして、上で作成したknexオブジェクトを実行して、Bookshelfオブジェクトを作成
var Bookshelf = require('bookshelf')(knex);

//Bookshelf.plugin('pagination');

//DBにあるテーブルを扱うためのモデルを作成(Model.extend)
var User = Bookshelf.Model.extend({     //Userモデル作成
  tableName: 'users'
});

var Message = Bookshelf.Model.extend({  //Messageモデル作成
  tableName:  'messages',
  hasTimestamps:  true,           //タイムスタンプのレコードを追加するもの、trueだとcreated_atに現在日時、変更時にupdated_atに日時が自動保存される
  user: function() {              //userというプロパティを追加
    return this.belongsTo(User);  //belongsTo():アソシエーションの一つ、テーブルに用意された関連テーブルIDを示す値を使って別のテーブルのレコードを一緒に取り出す
  }
});


router.get('/', (req, res, next) => {
  if (req.session.login == null) {
    res.redirect('/users');         //ログインページにリダイレクト
  } else {
    res.redirect('/1');             //トップページにリダイレクト
  }
});

router.get('/:page', (req, res, next) => {
  if(req.session.login == null) {
    res.redirect('/users');
    return;
  }
  var pg = req.params.page;
  pg *= 1;
  if(pg < 1){ pg = 1;}
  new Message().orderBy('created_at', 'DESC')                             //orderby():レコードを並び替えるメソッド、第一引数:フィールド名、第二引数:ASC or DESC
          .fetchPage({page:pg, pageSize:10, withRelated: ['user']})      //withRelated: 関連づけるテーブル名を指定するもの、これで関連する
          .then((collection) => {     //collection:DBから取り出されたレコードデータのオブジェクト(※BaseModelオブジェクトの配列になっている)
            var data = {
              title: 'miniBoard',
              login: req.session.login,
              collection: collection.toArray(),
              pagination: collection.pagination
            };
            res.render('index', data);
          }).catch((err) => {             //エラーが発生した場合
            res.status(500).json({error: true, data: {message: err.message}});    //status:引数に指定したステータスコードを送る
          });                                                                     //json:引数の情報をJSONデータとして出力する
});

router.post('/', (req, res, next) => {
  var rec = {
    message: req.body.msg,          //req.body:送信されたフォームの値msg
    user_id: req.session.login.id
  }
  console.log(req.session.login.id);
  new Message(rec).save().then((model) => {         //new Message(引数):引数のオブジェクトをMessageモデルに設定
    res.redirect('/');                              //save():モデルをテーブルに保存(引数は必要なし)
  });
})

module.exports = router;

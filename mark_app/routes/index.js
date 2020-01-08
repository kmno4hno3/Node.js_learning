//モジュールのロード
var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var knex = require('knex')({
  client: 'mysql',
  connection: {
              host:     'localhost',
              user:     'root',
              password: '',
              database: 'my-nodeapp-db',
              charset:  'utf8'
  }
});
var Bookshelf = require('bookshelf')(knex);


//モデルの生成
var User = Bookshelf.Model.extend({       //usersテーブルのモデル
  tableName: 'users'
})
var Markdata = Bookshelf.Model.extend({   //makdataテーブルのモデル
  tableName:  'markdata',
  hasTimestamps:  true,
  user: function() {                //下のwithRelated['user']と関連？
    return this.belongsTo(User);
  }
});


//ルーティング
  //トップページ
router.get('/', function(req, res, next) {
  if (req.session.login == null) {            //ログインしていない場合はログインページにリダイレクト
    res.redirect('/login');
    return;
  }
  new Markdata(['title']).orderBy('created_at', 'DESC')              //ログイン済みの場合、　新しい作成日のものから並べ換える   
        .where('user_id', '=', req.session.login.id)                    //ログインユーザーIDと同じuser_idを検索
        .fetchPage({page:1, pageSize:10, withRelated: ['user']})        //userというプロパティを宣言している?　いや違うか...　モデル生成での「user」か？
        .then((collection) => {
          var data = {
            title:  'Markdown Search',
            login:  req.session.login,                    //セッションのログイン情報
            message:  '※最近の投稿データ',
            form: {find: ''},                             //findのvalueは空
            content: collection.toArray()                 //トップページにてmarkdown表示(タイトル・aタグリンク先)
          };
          res.render('index', data);
        });
});

  //トップページで登録したテキスト検索をフォームから送信
router.post('/', function(req, res, next) {
  new Markdata().orderBy('created_at', 'DESC')                  //markdataテーブルのレコードを作成日を降順に
          .where('content', 'like', '%' + req.body.find + '%')  //送信した検索ワード(req.body.find)に一致するテキストを選定
          .fetchAll({withRelated: ['user']})
          .then((collection) => {
            var data = {
              title: 'Markdown Search',
              login:  req.session.login,                                    //セッションのログイン情報
              message: '※"' + req.body.find + '" で検索された最近の投稿データ',  //検索ボックスの下に表示する用の検索ワード(req.body.find)
              form: req.body,                                               //フォーム送信に設定するvalue用の値
              content:  collection.toArray()                                //検索ワードがヒットした場合、下に該当マークダウンのタイトルリンクを表示させるため(idとタイトル)
            };
            res.render('index', data);
          })
});

module.exports = router;

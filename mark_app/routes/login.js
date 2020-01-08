//モジュールのロード
var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const { check, validationResult } = require('express-validator');       //Express Validatorモジュールをロード
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
var User = Bookshelf.Model.extend({
  tableName: 'users'
})


//ルーティング
  //ログインページ(未ログイン)
router.get('/', (req, res, next) => {
  var data = {
    title:  'Login',
    form:   {name: '', password: ''},
    content:  '名前とパスワードを入力下さい。'
  }
  res.render('login', data);
})

  //ログイン情報をフォームから入力
router.post('/', 
  [
  //ExpressValidator.Validatorオブジェクトを返す
  check('name').isLength({ min: 1 }).withMessage("NAME は必ず入力して下さい。"),
  check('password').isLength({ min: 1 }).withMessage("PASSWORDは必ず入力して下さい。"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);   //バリデーションの実行結果を受け取っている
    var request = req;
    var response = res;
    if(!errors.isEmpty()) {                 //誤ったログイン情報入力がされている場合　→　エラー
      var content = '<ul class="error">';
      var result_arr = errors.array();
      for(var n in result_arr) {
        content += '<li>' + result_arr[n].msg + '</li>'
      }
      content += '</ul>';
      var data = {
        title:  'Login',
        content:  content,
        form: req.body 
      }
      response.render('login', data);
    } else {                                //正しいログイン情報が入力されている場合　→　DBの確認
      var nm = req.body.name;
      var pw = req.body.password;

      User.query({where: {name: nm}, andWhere: {password: pw}})       //usersテーブルに入力したユーザー情報があるか確認
            .fetch()
            .then((model) => {
              if( model == null) {                  //テーブルにユーザー情報がない場合
                var data = {
                  title: '再入力',
                  content:  '<p class="error">名前またはパスワードが違います。</p>',
                  form: req.body
                };
                response.render('login', data);
              } else {                              //テーブルにユーザー情報が存在する場合
                request.session.login = model.attributes;     //usersテーブルから取得したログイン情報をセッションに保存
                var data = {
                  title: 'Login',
                  content:  '<p>ログインしました!<br>トップページに戻ってメッセージを送信下さい。</p>',
                  form: req.body
                };
                response.render('login', data);
              }
            });
    }
});

module.exports = router;
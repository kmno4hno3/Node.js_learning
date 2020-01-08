//モジュールのロード
var express = require('express');   //Express本体
var router = express.Router();      //ルーティング
var mysql = require('mysql');       //mysql
const { check, validationResult } = require('express-validator');       //Express Validatorモジュールをロード

var knex = require('knex')({        //knex
    client: 'mysql',
    connection: {
              host:     'localhost',
              user:     'root',
              password: '',
              database: 'my-nodeapp-db',
              charset : 'utf8'
    }
});
var Bookshelf = require('bookshelf')(knex);   //Bookshelf


//モデルの作成
var User = Bookshelf.Model.extend({
  tableName: 'users'
});


//ルーティング
  //登録ページにアクセス
router.get('/add', (req, res, next) => {
  var data = {
    title:  'Users/Add',
    form: {name: '', password: '', comment: ''},
    content:  '※登録する名前・パスワード・コメントを入力下さい。'
  }
  res.render('users/add', data);
})
  //登録ページから新規登録データ送信
router.post('/add', 
  [
  //ExpressValidator.Validatorオブジェクトを返す
  check('name').isLength({ min: 1 }).withMessage("NAME は必ず入力して下さい。"),
  check('password').isLength({ min: 1 }).withMessage("PASSWORDは必ず入力して下さい。"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);   //バリデーションの実行結果を受け取っている

    var request = req;
    var response = res;

    if(!errors.isEmpty()) {
      var content = '<ul class="error">';
      var result_arr = errors.array();
      for (var n in result_arr){
        content += '<li>' + result_arr[n].msg + '</li>'
      }
      content += '</ul>';
      var data = {
        title:  'Users/Add',
        content:  content,
        form:   req.body
      }
      response.render('users/add', data);
    } else {
      request.session.login = null;
      new User(req.body).save().then((model) => {
        response.redirect('/');
      });
    };
});

  //ログインページにアクセス
router.get('/', (req, res, next) => {
  var data = {
    title: 'Users/Login',
    form:  {name:'', password: ''},
    content:  '名前とパスワードを入力下さい。'
  }
  res.render('users/login', data);
});

  //ログインページからログインデータ送信
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

    if(!errors.isEmpty()) {                 //エラーの場合
      var content = '<ul class="error">';
      var result_arr = errors.array();
      for (var n in result_arr){
        content += '<li>' + result_arr[n].msg + '</li>'
      }
      content += '</ul>';
      var data = {
        title:  'Users/Login',
        content:  content,
        form:   req.body
      }
      response.render('users/login', data);
    } else {                                //ログインできた場合
      var nm = req.body.name;
      var pw = req.body.password;
      User.query({where: {name: nm}, andWhere: {password: pw}})   //queryメソッドで名前(nm)とパスワード(pw)がレコードにあるかチェック、andWhere:whereでチェックした条件に加えてpwがあるもの
        .fetch()
        .then((model) => {
          if(model == null){
            var data = {
              title: '再入力',
              content: '<p class="error">名前またはパスワードが違います。</p>',
              form: req.body
            };
            response.render('users/login', data);
          } else {
            request.session.login = model.attributes;
            //console.log(request.session.login);
            var data = {
              title: 'Users/Login',
              content: '<p>ログインしました! <br>トップページに戻ってメッセージを送信して下さい。</p>',
              form: req.body
            };
            response.render('users/login', data);
          }
        });
    };
});

module.exports = router;

//モジュールのロード
var express = require('express');
var router = express.Router();

var MarkdonwIt = require('markdown-it');
var markdown = new MarkdonwIt();

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
var User = Bookshelf.Model.extend({         //userテーブル
  tableName: 'users'
})
var Markdata = Bookshelf.Model.extend({     //markdataテーブル
    tableName: 'markdata',
    hasTimestamps: true,
    user: function() {
        return this.belongTo(User);
    }
});


//ルーティング
  //マークダウン表示・検索ページ
router.get('/', (req, res, next) => {
    res.redirect('/');                     // /markにアクセスすると、/markにリダイレクト　(意味あるのか？)
    return;
});

    //マークダウン表示・検索ページの登録済みマークダウンのタイトルリンク(index.ejs)一覧を押した場合
router.get('/:id', (req, res, next) => {
    var request = req;
    var response = res;
    if (req.session.login == null){             //ログインしていない場合
        res.redirect('/login');                 //ログインページにリダイレクト
        return;
    }
    Markdata.query({where: {user_id: req.session.login.id},     //ログインユーザーのid
                    andWhere: {id: req.params.id}})             //req.prams　= 「URLパラメータの:id(マークダウンのid(user_idとは違う))」を取得している
            .fetch()
            .then((model) => {
                makepage(request, response, model, true);
            });
});

    //マークダウン表示・検索ページテキストをフォーム送信で更新する
router.post('/:id', (req, res, next)=> {
    var request = req;
    var response = res;
    var obj = new Markdata({id: req.params.id})                     //引数にクエリーパラメータで送られてきたid(マークダウンレコード)をMarkdataオブジェクトに設定
                .save({content: req.body.source}, {patch: true})    //第1引数に保存する本文(req.body.source)、第2引数にレコードの一部だけを変更する許可({patch: true})
                .then((model) => {
                    makepage(request, response, model, false);      //任意のマークダウンテキストを更新後、今いるページで更新後のテキストが表示
                });
});;


//makepage関数の定義
function makepage(req, res, model, flg) {
    var footer;
    if(flg) {                                                                   //flg = trueの場合
        var d1 = new Date(model.attributes.created_at);                             //取得したレコードの作成日をセット
        var dstr1 = d1.getFullYear() + '-' + (d1.getMonth() + 1) + '-'                  //セットした作成日を 2020-1-8　のように変換して代入
            + d1.getDate();
        var d2 = new Date(model.attributes.updated_at);                             //取得したレコードの更新日をセット
        var dstr2 = d2.getFullYear() + '-' + (d2.getMonth() + 1) + '-'                  //セットした更新日を 2020-1-8　のように変換して代入
            + d2.getDate();
        footer = '(created: ' + dstr1 + ', updated: ' + dstr2 + ')';                //上でただ定義したfooterに作成日と更新日を代入
    } else {                                                                   //flg = falseの場合
        footer = '(Updating date and time information...)'                          //日付は代入せずに別な値を入れる
    }
    var data = {
        title:  'Markdown',
        id:     req.params.id,                                  //URLパラメータの:id(マークダウンのid)
        head:   model.attributes.title,                         //レコードから取得したマークダウンのタイトル
        footer: footer,                                         //上で定義したfooter(日付)
        content: markdown.render(model.attributes.content),     //HTMLコードに変換したマークダウン本文、HTMLヘの変換はmarkdown-itのrenderメソッドを呼び出す
        source: model.attributes.content                        //マークダウン本文
    };
    res.render('mark', data);
}

module.exports = router;
var express = require("express");
var router = express.Router();

router.get('/', (req, res, next) => {      //ここはhello下の「/」になる(/hello/)
    var msg = '※何か書いて送信して下さい。';
    if(req.session.message != undefined){               //req.session.messageがundefinedかチェック
        msg = "Last Message: " + req.session.message;   //値が保管されている時だけ、値を取り出してメッセージを作成
    }
    var data = {
        title: "Hello!",
        content: msg
    };
    res.render("hello", data);
})

router.post('/post', (req, res, next) => {    //postメソッドでPOSTアクセスの処理を行う
    var msg = req.body['message'];
    req.session.message = msg;          //セッションに値を保存
    var data = {
        title: 'Hello!',
        content: 'Last Message: ' + req.session.message
    };
    res.render('hello', data);
});

module.exports = router;
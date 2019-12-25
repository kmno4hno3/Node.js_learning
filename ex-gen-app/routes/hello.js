var express = require("express");
var router = express.Router();

router.get('/', (req, res, next) => {      //ここはhello下の「/」になる(/hello/)
    var name = req.query.name;      //クエリーパラメーターを送る
    var mail = req.query.mail;      //クエリーパラメーターを送る
    var data = {
        title: "Hello!",
        content: "あなたの名前は、" + name + '。<br>' +
            'メールアドレスは、' + mail + 'です。'
    };
    res.render("hello", data);
})

module.exports = router;
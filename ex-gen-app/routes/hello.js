var express = require("express");
var router = express.Router();

router.get('/', (req, res, next) => {      //ここはhello下の「/」になる(/hello/)
    var data = {
        title: "Hello!",
        content: "これは、サンプルのコンテンツです。<br>this is sample content."
    };
    res.render("hello", data);
})

module.exports = router;
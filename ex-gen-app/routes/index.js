var express = require('express');
var router = express.Router();    //Router:ルーティングに関する機能をまとめたもの

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

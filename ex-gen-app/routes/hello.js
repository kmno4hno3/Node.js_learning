var express = require('express');
var router = express.Router();

//モジュールのロードは基本的にapp.jsだが、以下の機能は/helloでしか使わないのでここでhello.jsでロードする
var http = require('https');                            //webサイトへのアクセスするためのモジュール(ここではHTTPSを使う)
var parseString = require('xml2js').parseString;

router.get('/', (req, res, next) => {      //ここはhello下の「/」になる(/hello/)
    var opt = {
        host: 'news.google.com',           //ホスト(ドメイン)
        port: 443,                         //ポート番号(HTTPSアクセスなら443番、HTTPアクセスなら80番)
        path: '/rss?ie=UTF-8&oe=UTF-8&hl=en-US&gl=US&ceid=US:en'        //パス(ドメイン以降の部分)
    };
    http.get(opt, (res2) => {               //http.get(アクセスに関するオプション設定, コールバック関数)、第1引数の情報を元にアクセス開始し、GET終了時に第2引数のコールバック関数を呼び出す
        var body = '';                      //https.getのコールバック関数ではresponseオブジェクトが引数に渡される
        res2.on('data', (data) => {         //このresponseにデータを取得した際のイベントを設定
            body += data;
        });
        res2.on('end', () => {
            parseString(body.trim(), (err, result) => {     //XMLデータをパースする(XMLテキストを元にXMLのオブジェクトを作る)、parseString(XMLのテキスト, コールバック関数)
                var data = {                                //コールバック関数の第1引数:エラーに関するオブジェクト、第2引数:パースして作成されたオブジェクト
                    title: 'Hello!',
                    content: result.rss.channel[0].item     //RSSデータから必要なデータを取り出している
                };
                res.render('hello', data);
            });
        })
    });
});

module.exports = router;
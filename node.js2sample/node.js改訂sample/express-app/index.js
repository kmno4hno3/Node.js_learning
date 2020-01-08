var express = require('express');
var ejs = require("ejs");

var app = express();
app.engine('ejs',ejs.renderFile);
app.use(express.static('public'));

var bodyParser = require('body-parser'); //★追加
app.use(bodyParser.urlencoded({extended: false})); //★追加

var data = {
    'Taro':'taro@yamada',
    'Hanako':'hanako@flower',
    'Sachiko':'sachico@happy',
    'Ichiro':'ichiro@baseball',
};

app.get('/',(req, res) => {
    var msg = 'This is Index Page!<br>' 
        + '※データを表示します。';
    res.render('index.ejs', 
        {
            title: 'Index', 
            content: msg, 
            data:data,
        });
});

// ※POST送信の処理
app.post('/',(req, res) => {
    var msg = 'This is Posted Page!<br>' +
        'あなたは「<b>' + req.body.message + 
        '</b>」と送信しました。';
    res.render('index.ejs', 
        {
            title: 'Posted', 
            content: msg, 
        });
});

var server = app.listen(3000,() => {
    console.log('Server is running!');
})


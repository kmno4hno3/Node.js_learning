//require()メソッド require(ID)
//Node.jsではオブジェクトをモジュール化してそのモジュールIDを指定して使用
const http = require('http');   //インターネットアクセスするhttpオブジェクトを変数として設定
const fs = require('fs');       //ファイルを扱うfsオブジェクトを変数に
const ejs = require('ejs');     //ejsオブジェクトの読み込み
const url = require('url');     //URLを扱うためのオブジェクトの読み込み
const qs = require('querystring');  //Query Stringモジュール：クエリーテキストを処理する機能(URLではなく、普通のテキスト)

//readFileSyncメソッドは同期処理でファイルを読み込む(readFileは非同期処理)
//テンプレートファイルの読み込み
const index_page = fs.readFileSync('./index.ejs', 'utf8');      //fsオブジェクト内にあるreadFileSyncメソッドでファイルを読み込む
const login_page = fs.readFileSync('./login.ejs', 'utf8');          //読み込んでから何十秒も時間がかかるから
const style_css = fs.readFileSync('./style.css', 'utf8');

const max_num = 10;     //最大保管数
const filename = 'mydata.txt';
var message_data;   //データ保存用変数
readFromFile(filename);     //データをロード

var server = http.createServer(getFromClient);  //サーバーのオブジェクト作成

server.listen(3000);            //listen()メソッドで待ち受け状態にする、引数はポート番号
console.log('Server start!');

//ここまでメインプログラム


//createServerの処理
//createServerで作成されたhttp.Serverオブジェクトがサーバとして実行されたときに必要
//実行したサーバに誰かがアクセスしたら、この関数が呼び出される
function getFromClient(request, response){      //クライアントからサーバへの要求、サーバからクライアントへの返信をそれぞれ管理

    //request   (1)http.ClientRequestオブジェクトが入っている
    //response  (2)http.ServerResponseオブジェクトが入っている
    //(1)(2)はそれぞれの情報や機能をまとめたもの

    //url.parse：URLデータをパースして、ドメインやパス部分などををそれぞれの要素に分けて整理するメソッド
    //request.url：リクエストのURLが保管されているプロパティ
    var url_parts = url.parse(request.url, true);   //trueを入れると、クエリーパラメーター部分もパース処理される
    switch (url_parts.pathname){                   //pathnameでURLの/以降を取り出す

        case '/':   //トップページ(掲示板)
            response_index(request, response);
            break;

        case '/login':   //ログインページ
            response_login(request, response);
            break;
        
        case '/style.css':
            response.writeHead(200, {'Content-Type': 'text/css'});
            response.write(style_css);  //end()と違い、出力したあとも次も書き出せる
            response.end();             //end()はクライアントへの返信を終了するメソッド、()内にテキストが会ったら出力して終了
            break;
        
        default:
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end('no page...');
        break;
    }

}

//loginのアクセス処理
function response_login(request, response){
    var content = ejs.render(login_page, {});               //テンプレートファイルのレンダリング、引数は読み込んだテンプレートファイルの変数
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(content);
    response.end();
}

//indexのアクセス処理
function response_index(request, response){
    //POSTアクセス時の処理
    if(request.method == 'POST'){       //method：リクエストがGETかPOSTかを表す値
        var body = '';

        //データ受信のイベント処理
        request.on('data', function(data){      //指定のイベントが発生したら、設定した関数を実行('data'：クライアントからデータを受け取ると発生するイベント)
            body += data;
        });

        //データ受信終了のイベント処理
        request.on('end', function(){       //クライアントからのデータ受け取りが完了すると発生するイベント
            data = qs.parse(body);          //上で受け取った値(body)はqs.parseでエンコードし、それぞれのパラメーターの値を整理してオブジェクトに変換
            addToData(data.id, data.msg, filename, request);
            write_index(request, response);
        });
    }else{
        write_index(request, response);
    }
}

//indexのページ作成
function write_index(request, response){
    var msg = "※何かメッセージを書いて下さい。";
    var content = ejs.render(index_page, {      //第２引数はテンプレートファイル中で置き換える変数のオブジェクト
        title: 'Index',
        content:msg,
        data:message_data,
        filename:'data_item',       //パーシャルファイル名
    });
    response.writeHead(200, {'Content-Type': 'text/html'});  //コンテンツの種類：テキストデータでHTML形式であることを示す
    response.write(content);
    response.end();
}

//テキストファイルをロード
function readFromFile(fname){
    //コールバック関数「時間のかかる処理が終わったら、あとで呼び出される」
    //第一引数：読み込み時エラーが起きたらエラー情報のオブジェクトが渡される、エラーがなかったら空
    //第二引数：ファイルから読み込んだデータ
    fs.readFile(fname, 'utf8', (err, data) => {    //ファイル名, ファイル内容のエンコーディング方式、readFileが完了した後に実行する関数を、引数に
        message_data = data.split('\n');          //改行で分割して配列に
    })
}

//データを更新
function addToData(id, msg, fname ,request){
    var obj = {'id':id, 'msg':msg};         //送信されてきたデータをオブジェクトにまとめる
    var obj_str = JSON.stringify(obj);      //作成したオブジェクトをJSON形式のテキストに変換
    console.log('add data: ' + obj_str);
    message_data.unshift(obj_str);      //unshift()で配列の最初に値を追加
    if(message_data.length > max_num){
        message_data.pop();         //最後のデータを削除
    }
    saveToFile(fname);
}

//データを保存
function saveToFile(fname){
    var data_str = message_data.join('\n');       //配列を1つのテキストにまとめる、引数で区切る
    fs.writeFile(fname, data_str, (err) => {       //ファイル名、テキストを引数に指定し、保存後に第3引数の処理を実行
        if(err){ throw err;}                            //保存が完了したら第3引数のコールバック関数が実行
    });                                                 //引数にERRORオブジェクトが渡される
}
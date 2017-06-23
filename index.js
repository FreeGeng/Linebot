var linebot = require('linebot');
var express = require('express');
var getJSON = require('get-json');

var bot = linebot({
  channelId: 1521338926,
  channelSecret: 'e90fe6f72c4165bcfaaab996c8158f54',
  channelAccessToken: 'xBMq2+BJ/RtP6FvPKF0GjpJSVCTFQQYWFMSX8EJJAe0UfSDDcLqkxU9oGWFh1hJSc2QhapVx215C74mpzfPfRWRfw05p7MGKa/znmFrAs9L7AKTApVLIRLebkZQXCTiT8gC/d7AXJFt5zOzH7Sjj5gdB04t89/1O/w1cDnyilFU='
});

/*bot.on('message', function(event) {
  console.log(event); //把收到訊息的 event 印出來看看
});*/


var timer;
var pm = [];
_getJSON();

_bot();
const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

_pmvalue();

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});

function _bot() {
  bot.on('message', function(event) {
    if (event.message.type == 'text') {
      var msg = event.message.text;
      _pmvalue(msg);
    }
  });

}

function _pmvalue(msg){
	  var replyMsg = '';
      if (msg.indexOf('PM2.5') != -1) {
        pm.forEach(function(e, i) {
          if (msg.indexOf(e[0]) != -1) {
          	if(e[1]>50){
             replyMsg = e[0] + '的PM2.5=' + e[1] + ' 要死人啦~';
            }
            else{
             replyMsg = e[0] + '的PM2.5=' + e[1] + ' 出去玩摟~';     
            }
          }

        });
        if (replyMsg == '') {
          replyMsg = '我要地點! 然後我沒有連續性!請給我完整指令==';
        }
      }
      if (replyMsg == '') {
        replyMsg = msg + '是什麼意思? 講人話R ';
      }

      event.reply(replyMsg).then(function(data) {
        console.log(replyMsg);
      }).catch(function(error) {
        console.log('error');
      });
    
}

function _getJSON() {
  clearTimeout(timer);
  getJSON('http://opendata2.epa.gov.tw/AQX.json', function(error, response) {
    response.forEach(function(e, i) {
      pm[i] = [];
      pm[i][0] = e.SiteName;
      pm[i][1] = e['PM2.5'] * 1;
      pm[i][2] = e.PM10 * 1;
    });
  });
  timer = setInterval(_getJSON, 1800000); //每半小時抓取一次新資料
}
var linebot = require('linebot');
var express = require('express');
var getJSON = require('get-json');
var request = require('request');//get open data
var cheerio = require('cheerio');//for parse open data

var bot = linebot({
  channelId: 1521338926,
  channelSecret: 'e90fe6f72c4165bcfaaab996c8158f54',
  channelAccessToken: 'xBMq2+BJ/RtP6FvPKF0GjpJSVCTFQQYWFMSX8EJJAe0UfSDDcLqkxU9oGWFh1hJSc2QhapVx215C74mpzfPfRWRfw05p7MGKa/znmFrAs9L7AKTApVLIRLebkZQXCTiT8gC/d7AXJFt5zOzH7Sjj5gdB04t89/1O/w1cDnyilFU='
});

//function execution
var timer;//for PM2.5
var timer2;//for exchange rate
var pm = [];
_getJSON();

_bot();
const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});



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

function _bot() {
  bot.on('message', function(event) {
    if (event.message.type == 'text') {	
      var msg = event.message.text;
      console.log('get：'+msg);

      if(msg.indexOf('pm2.5') != -1||msg.indexOf('PM2.5') != -1 ){
      pmvalue(event,msg);
      }
      else if(msg.indexOf('匯率')!= -1){
      var userId = 'U7921a56a665525ddf9198ea3807a460f';//my userId
      var sendMsg = '支援匯率： ';
      var sendMsg2 = '美金、港幣、英鎊、澳幣、加拿大幣、新加坡幣、瑞士法郎、日圓、南非幣';
      var sendMsg3 = '瑞典幣、紐元、泰幣、菲國比索、印尼幣、歐元、韓元、越南盾、馬來幣、人民幣';
      bot.push(userId,sendMsg+sendMsg2+sendMsg3);
      console.log('send: '+sendMsg+sendMsg2+sendMsg3);
      getExchangeRate();
      }

    }
  });

}

function pmvalue(event,msg){
	  console.log('enter PM function');
	  var replyMsg = '';
      if (msg.indexOf('pm2.5') != -1||msg.indexOf('PM2.5') != -1) {
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

function getExchangeRate() {
  console.log('enter ER function');
  var moneyArr = ["美金","港幣","英鎊","澳幣","加拿大幣","新加坡幣","瑞士法郎","日圓",
	  "南非幣","瑞典幣","紐元","泰幣","菲國比索","印尼幣","歐元","韓元","越南盾","馬來幣","人民幣"];

  bot.on('message', function(event) {
    if (event.message.type == 'text') {	
      var msg = event.message.text;
      console.log('get：'+msg);
      
      var counter = 0;
      for(i=0;i<moneyArr.length;i++){
      	if(moneyArr.indexOf(msg) != -1){
      	  counter=i;
      	  break;
      	}
      }

      var replyMsg = '';
  request({
    url: "http://rate.bot.com.tw/Pages/Static/UIP003.zh-TW.htm",
    method: "GET"
  }, function(error, response, body) {
    if (error || !body) {
      return;
    } else {
      var $ = cheerio.load(body);
      var target = $(".rate-content-sight.text-right.print_hide");
      console.log(target[counter*2-1].children[0].data);
      answer = target[counter*2-1].children[0].data;
      replyMsg = msg+'匯率= ' + answer;
      event.reply(replyMsg).then(function(data) {
        console.log(replyMsg);
      }).catch(function(error) {
        console.log('error');
      });
    }
  });
      
    }
  });
};

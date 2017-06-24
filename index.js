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
var exCounter;//for exchange rate counter
var pm = [];
_getJSON();

_bot();
const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);//接收來自Line server的訊息

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
      var userId = event.source.userId;
      var msg = event.message.text;
      console.log('get userID:'+userId);
      console.log('get：'+msg);
      var sendMsg ='';

      if(msg.indexOf('pm2.5') != -1||msg.indexOf('PM2.5') != -1 ){
      pmvalue(event);
      }
      else if(msg.indexOf('匯率')!= -1){
      sendMsg = '支援匯率： ';
      var sendMsg2 = '美金、港幣、英鎊、澳幣、加拿大幣、新加坡幣、瑞士法郎、日圓、南非幣';
      var sendMsg3 = '瑞典幣、紐元、泰幣、菲國比索、印尼幣、歐元、韓元、越南盾、馬來幣、人民幣';
      var sendMsg4 = '請輸入貨幣(例:$$美金,$$港幣)'

      bot.push(userId,sendMsg+sendMsg2+sendMsg3);
      console.log('send:'+sendMsg+sendMsg2+sendMsg3);
      bot.push(userId,sendMsg4);
      console.log('send:'+sendMsg4);
      }
      else if(msg.indexOf('$$')!= -1){
      getExchangeRate(event);
      }
      else if(msg.indexOf('天氣')!=-1){
      weather(event);
      }
      else{
      	sendMsg = msg;
      	bot.push(userId,sendMsg);
      	console.log('send:'+sendMsg);
      }

    }
  });

}

function pmvalue(event){
	  console.log('enter PM function');
	  var replyMsg = '';
	  var msg = event.message.text;
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
          replyMsg = '我要地點! 然後我沒有連續性!請給我完整指令';
        }
      }
      if (replyMsg == '') {
        replyMsg = msg + '是什麼意思? 講人話R ';
      }

      bot.push(event.source.userId,replyMsg);  
}

function getExchangeRate(event) {
  console.log('enter ER function');
  var moneyArr = ["美金","港幣","英鎊","澳幣","加拿大幣","新加坡幣","瑞士法郎","日圓",
	  "南非幣","瑞典幣","紐元","泰幣","菲國比索","印尼幣","歐元","韓元","越南盾","馬來幣","人民幣"];
  var replyMsg = '';
  var replyMsg2 = '';
  var replyMsg3 = '';
  var replyMsg4 = '';

  var flag = -1;
  var msg = event.message.text;
  for(i=0;i<moneyArr.length;i++){
     if(msg.indexOf(moneyArr[i]) != -1){
     	flag = 1;
      	exCounter = i;
      	console.log('compare succeed!');
      	break;
     }  
  }
  
  if(flag==-1){
     console.log('compare error!');
     replyMsg = '沒這個選項QQ 你是不是拼錯了';
     bot.push(event.source.userId,replyMsg);  
     return; 
  }
  
  request({
    url: "http://rate.bot.com.tw/Pages/Static/UIP003.zh-TW.htm",
    method: "GET"
  }, function(error, response, body) {
    if (error || !body) {
      return;
    } else {
      var $ = cheerio.load(body);
      var target = $(".rate-content-sight.text-right.print_hide");//即期
      var target2 = $(".rate-content-cash.text-right.print_hide");//現金
      console.log('get target Index:'+ exCounter);
      var exCounter2 = exCounter*2;
      
      var answer = target[exCounter2].children[0].data;
      console.log(target[exCounter2].children[0].data);
      replyMsg = moneyArr[exCounter]+'即期買入匯率= ' + answer;

      
      var answer2 = target[exCounter2+1].children[0].data;
      console.log(target[exCounter2+1].children[0].data);
      replyMsg2 = moneyArr[exCounter]+'即期賣出匯率= ' + answer2;

      var answer3 = target2[exCounter2].children[0].data;
      console.log(target2[exCounter2].children[0].data);
      replyMsg3 = moneyArr[exCounter]+'現金買入匯率= ' + answer3;

      
      var answer4 = target2[exCounter2+1].children[0].data;
      console.log(target2[exCounter2+1].children[0].data);
      replyMsg4 = moneyArr[exCounter]+'現金賣出匯率= ' + answer4;

      var finalMsg = replyMsg+'\n'+replyMsg2+'\n'+replyMsg3+'\n'+replyMsg4;
      bot.push(event.source.userId,finalMsg);  
    }
  });
}


function weather(event){
  request({
        uri: 'http://opendata.cwb.gov.tw/catalog?group=f&dataid=C0032-005',
        method: 'GET',
  },function (error, response, body) {
            //Check for error
            if (error) {
                return console.log('Error:', error);
            }
            
            //var data = cheerio.load(body);
            console.log('weather.data:'+body);

            // 傳送 城市名稱 天氣狀況 溫度
            //replyMsg = data.name + " " + data.weather[0].description + " 溫度:" + data.main.temp)
            //bot.push(userId,replyMsg);  

        }
    );

}
var linebot = require('linebot');
var express = require('express');

var bot = linebot({
  channelId: 1521338926,
  channelSecret: e90fe6f72c4165bcfaaab996c8158f54,
  channelAccessToken: xBMq2+BJ/RtP6FvPKF0GjpJSVCTFQQYWFMSX8EJJAe0UfSDDcLqkxU9oGWFh1hJSc2QhapVx215C74mpzfPfRWRfw05p7MGKa/znmFrAs9L7AKTApVLIRLebkZQXCTiT8gC/d7AXJFt5zOzH7Sjj5gdB04t89/1O/w1cDnyilFU=
});

bot.on('message', function(event) {
  console.log(event); //把收到訊息的 event 印出來看看
});

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});
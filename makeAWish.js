console.log("知道自己在做什么吗？");
return;


var http = require("https");
var cheerio=require("cheerio");
var fs = require('fs');

var smtpUser="yunteng.ma@houpix.com";
var smtpPwd="**********";
var smtpServer="smtp.qiye.163.com";

var startUrl="https://github.com/search?l=JavaScript&q=location%3Ashanghai&ref=searchresults&type=Users&utf8=%E2%9C%93";

var email   = require("emailjs/email");
var server  = email.server.connect({
   user:    smtpUser, 
   password:smtpPwd, 
   host:    smtpServer
});
var text=fs.readFileSync("email.txt",'utf-8');
var sendedTmp=fs.readFileSync("log.txt",'utf-8').split("\n");
var sended={};
for(var i=0,len= sendedTmp.length ;i< len;i++){
  sended[sendedTmp[i]]= true;
}
console.log(sended.length+"已发");

console.log("开工");

getEmails(1);

function getEmails(page) {
  console.log("开始抓取第 "+page+" 页");
  http.get(startUrl+"&p="+page, function(res) {
    var data = "";
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on("end", function() {
    var $ = cheerio.load(data);

    $(".email").each(function(i, e) {
      var email=$(e).text();
      var div=$(e).parent().parent().parent().parent();
      $("a",div).remove();
      $("ul",div).remove();
      var username=div.text().trim();
      if(email.indexOf("@")>0&&username.length>1)
        sendEmail(email,username);
      });
 
    if(!$(".next_page").hasClass("disabled")){
      //next page
      getEmails(page+1);
    }
    });
  }).on("error", function() {
    console.log("error "+page);
  });
}


function sendEmail(toEmail,toName){
  if(sended[toEmail]){
    console.log(toEmail+" 已发");
    return;
  }
  var message = {
     text:    text.replace("${name}",toName), 
     from:    "马云腾 <"+smtpUser+">", 
     to:      toName+" <"+toEmail+">",
     subject: "来自马云腾的邀请函",
  };

  server.send(message, function(err, message) { 
    if(err){
      console.log(err);
    }else{
      console.log("sended to "+toName+" <"+toEmail+">\n"+message.text);
      fs.appendFile("log.txt",toEmail+"\n");
      sended[toEmail]=true;
    }
  });
}

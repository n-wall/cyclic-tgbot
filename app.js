const express = require('express')
//const path = require("path");
const { webhookCallback} = require("grammy");

const app = express()
const bot = require('./tgbot')


// #############################################################################
// Logs all request paths and method
app.use(function (req, res, next) {
  //res.set('x-timestamp', Date.now())
  //res.set('x-powered-by', 'cyclic.sh')
  console.log(`[${new Date().toISOString()}] ${req.ip} ${req.method} ${req.path}`);
  next();
});

// #############################################################################
// 有如下后辍名的文件作为静态文件，在public目录下查找
// 如 xxx.xxx.com/a/main.css 会找 public/a/main.css 文件
var options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html','css','js','ico','jpg','jpeg','png','svg','gif'],
  index: ['index.html'],
  maxAge: '1m',
  redirect: false
}
app.use(express.static('public', options))

app.use(express.json()); // 解析 JSON 请求
// 处理 tgbot 请求。
if (process.env.SECRET_TOKEN){
  app.use("/tghook", webhookCallback(bot, "express", {secretToken: process.env.SECRET_TOKEN}));
} else {
  app.use("/tghook", webhookCallback(bot, "express"));
}

// latex equations to picture
var router = require("./latex/router")
app.use('/equ2pic',router) //router路由对象中的路由都会匹配到"/equ2pic"路由后面

// #############################################################################
// Catch all handler for all other request.
app.use('*', (req,res) => {
  res.json({
      at: new Date().toISOString(),
      method: req.method,
      hostname: req.hostname,
      ip: req.ip,
      query: req.query,
      headers: req.headers,
      cookies: req.cookies,
      params: req.params
    })
    .end()
})

module.exports = app

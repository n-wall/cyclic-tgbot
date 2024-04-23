const express = require('express')
const router = express.Router()


var equ = require('./equ2pic')
var equ2pic=equ.parse;
var text2d=equ.path

router.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

router.post('*', (req, res) => {
  console.log("-- post: ", req.body)
  //res.set('Content-Type', 'text/plain')
  post=req.body
  if(post.formula){
    console.log("   formula: ", post.formula)
    //console.log("   png?: ", post.png)
    var format=''
    if (post.png=='on'){
      format='png'
    }
    if(post.jpg=='on'){
      format='jpg'
    }
    if(post.format){
      format=post.format
    }
    console.log("   format: ", format)

    equ2pic(post.formula, {format: format, height: Number(post.height)}, (err, result)=>{
      //var html = "PNG?"+png+"<br/> get formula: "+formula
      res.status(result.statusCode).set(result.headers)
      if(result.isBase64Encoded){
	res.end(result.body, 'base64')
      } else {
        res.end(result.body)
      }
    })
  } else {
    res.status(204).set({'Content-Type': 'text/html'})
    res.end('No formula received ')
  }
  
  //res.send("<h1>OK</h1>")
  // res.end(data, encoding) // same as http.ServerResponse
})


var html = `
<html>
<head>
   <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
</head>
<body>
   <h3> Latex formula into picture </h3>
   <form method="post" action="">
      png? <input type="checkbox" name="png"/>
      jpg? <input type="checkbox" name="jpg"/><br/>
      height for png or jpeg: <input type="text" name="height" value="100" size=10/> <br/>
      公式: <textarea name="formula" cols="50" rows="4">\\mbox{只}, \\sqrt{\\frac{\\sin x}x}</textarea> <br/>
      <input type="submit" value="Submit" />
   </form>
   <h4> 简介 </h4>
   <p> 本服务将latex公式变成svg, png 或 jpeg 格式的图片 </p>
   <p> 服务也可以使用 GET 的方式 
   <ul>
     <li>SVG图片： GET /latex2pic/{formula} </li>
     <li>PNG图片： GET /latex2pic/png/{formula}</li>
     <li>Jpeg图片： GET /latex2pic/jpeg/{formula}</li>
     <li>SVG path数据： GET /latex2pic/2path/{text}</li>
     <li>SVG 数据： GET /latex2pic/2svg/{text}</li>
   </ul>
   其中{formula}表示Latex公式， {text}表示一般文本
   </p>
   <p> 服务由 cyclic 提供 </p>
   <p> 服务使用了NodeJS的库： MathJax@3, sharp </p>
   <p>NodeJS ${process.version}</p>
</body>
</html>`

router.get("/", (req,res)=>{
  res.status(200).set({'Content-Type': 'text/html'})
  res.end(html)
})

router.get("/png/*", (req,res)=>{
  /*res.json({
    path: req.path,
    query: req.query,
    params: req.params
  })
  .end()*/
  equ2pic(req.params[0], {format: "png" }, (err, result)=>{
    //var html = "PNG?"+png+"<br/> get formula: "+formula
    res.status(result.statusCode).set(result.headers)
    if(result.isBase64Encoded){
      res.end(result.body, 'base64')
    } else {
      res.end(result.body)
    }
  })
})

router.get("/jpeg/*", (req,res)=>{
  /*res.json({
    path: req.path,
    query: req.query,
    params: req.params
  })
  .end()*/
  equ2pic(req.params[0], {format: "jpg" }, (err, result)=>{
    //var html = "PNG?"+png+"<br/> get formula: "+formula
    res.status(result.statusCode).set(result.headers)
    if(result.isBase64Encoded){
      res.end(result.body, 'base64')
    } else {
      res.end(result.body)
    }
  })
})

router.get("/*", (req,res)=>{
  /*res.json({
    path: req.path,
    query: req.query,
    params: req.params
  })
  .end()*/
  equ2pic(req.params[0], {}, (err, result)=>{
    //var html = "PNG?"+png+"<br/> get formula: "+formula
    res.status(result.statusCode).set(result.headers)
    if(result.isBase64Encoded){
      res.end(result.body, 'base64')
    } else {
      res.end(result.body)
    }
  })
})


router.get("*", (req,res)=>{
  res.json({
    path: req.path,
    query: req.query,
    params: req.params
  })
  .end()
})


router.get('/:formula', (req,res) => {
  console.log(req.path)
  //res.end("OK"+req.params.formula)
  equ2pic(req.params.formula, null, (err, result)=>{
    //var html = "PNG?"+png+"<br/> get formula: "+formula
    res.status(result.statusCode).set(result.headers)
    if(result.isBase64Encoded){
      res.end(result.body, 'base64')
    } else {
      res.end(result.body)
    }
  })
  
})


module.exports = router;


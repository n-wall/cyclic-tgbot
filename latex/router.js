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


var routeurl="/equ2pic"
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
     <li>SVG图片： GET ${routeurl}/{formula} </li>
     <li>PNG图片： GET ${routeurl}/png/{formula}</li>
     <li>Jpeg图片： GET ${routeurl}/jpeg/{formula}</li>
     <li>SVG path d数据： GET ${routeurl}/2path/{text} <br/>
         返回的数据放置在 svg 文件中， &lt; path id="u53ea" d="[数据]" &gt;
     </li>
   </ul>
   其中{formula}表示Latex公式， {text}表示一般文本
   </p>
   <p> 服务由 cyclic 提供 </p>
   <p> 服务使用了NodeJS的库： MathJax@3, sharp, express </p>
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
    if(req.query.height){
	height=Number(req.query.height)
    }else{
	height=200
    }
    equ2pic(req.params[0], {format: "png", height:height }, (err, result)=>{
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
    if(req.query.height){
	height=Number(req.query.height)
    }else{
	height=200
    }
    equ2pic(req.params[0], {format: "jpg", height:height }, (err, result)=>{
    //var html = "PNG?"+png+"<br/> get formula: "+formula
    res.status(result.statusCode).set(result.headers)
    if(result.isBase64Encoded){
      res.end(result.body, 'base64')
    } else {
      res.end(result.body)
    }
  })
})

// 2path/ 用于得到汉字的svg path d属性
router.get("/2path/:text", (req,res)=>{
  /*res.json({
    path: req.path,
    query: req.query,
    params: req.params
  })
  .end() // */
  text2d(req.params.text, 884, (err, result)=>{
     res.writeHead(result.statusCode, result.headers)
     res.end(result.body)
  })

})

router.get("/*", (req,res)=>{
  /*res.json({
    path: req.path,
    query: req.query,
    params: req.params
  })
  .end()*/
    if(req.query.height){
	height=Number(req.query.height)
    }else{
	height=200
    }
    if(req.query.format){
	format=req.query.format
    }else{
	format=null
    }
    equ2pic(req.params[0], {format:format, height:height}, (err, result)=>{
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


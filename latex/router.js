const express = require('express')
const router = express.Router()


var equ = require('./equ2pic')
var equ2pic=equ.parse;
var text2d=equ.path


router.post('*', (req, res) => {
  console.log("-- post: ", req.body)
  //res.set('Content-Type', 'text/plain')
  post=req.body
  if(post.formula){
    console.log("   formula: ", post.formula)
    console.log("   png?: ", post.png)
    equ2pic(post.formula, post.png, (err, result)=>{
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


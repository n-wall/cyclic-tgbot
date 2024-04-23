//  -*- mode: js; js-indent-level: 2; -*-
// convert latex equation into svg or png picture

// module text-to-svg
// get path for character uchar , simplified chinese
function charpath(textToSVG, uchar){
  //const TextToSVG = require('text-to-svg');
  //const textToSVG = TextToSVG.loadSync('./sc.otf'); // simplified chinese

  const attributes = {} // {fill: 'red', stroke: 'black'};
  const options = {
    x: 0, y: 0,
    fontSize: 884,
    //anchor: 'top',
    attributes: attributes};

  // M5.27-54.07L10.62-54.07L10.62-34.00Q15.86-39.23 21.02-39.23... Z
  var d = textToSVG.getD(uchar, options);
  return {
    'd': d, 'code':'u'+uchar.charCodeAt(0).toString(16),
    'char':uchar}
}


// module xml2js
// convert chinese character inside svg to path
//  callback(err, result)
function cn2path(svgBuffer, callback){
  var xml2js = require('xml2js');
  var parser = new xml2js.Parser();

  parser.parseString(svgBuffer, function (err, result) {
    //console.dir(result);
    if(err){ callback(err, svgBuffer) }
    //console.log('svg to json Done', err); err=null for success
    // result 中是一多重的 json
    let res = [] // 保存需要的path
    function origin(obj) {
      for (let [key,value] of Object.entries(obj)) {
	swap(value,key,obj)
      }
      return res
    }
    // 递归函数 swap 遍历整个 json 对象
    function swap(www,res1 = '',parent) {
      //console.log("--key:"+res1)
      if(res1.endsWith('text'))
      {
	// found text in svg
	//console.log(www)
	//console.log(parent)
	//console.log(parent.use)
	let uses=[]
	for(kk in www){
	  // console.log(kk, www[kk],www[kk].$.transform)
	  res.push(www[kk]._)
	  let uchar=www[kk]._
	  uses.push({'$':{
	    'data-c': uchar,
	    'xlink:href': '#u'+uchar.charCodeAt(0).toString(16),
	    transform: www[kk].$.transform}
		    })
	}
	if(parent.use){
	  parent.use = parent.use.concat(uses)
	} else {
	  parent.use=uses
	}
	//www.push({
	//    '$':{transform: 'scale(1,-1)'}
	//})
	delete(parent.text)
	return
      }

      if(Array.isArray(www)){
	for(let r = 0;r<www.length;r++){
	  swap(www[r],res1  + '['+r.toString()+']', www)
	}
      }else if(Object.prototype.toString.call(www) == '[object Object]'){
	for (let [key,value] of Object.entries(www)) {
	  swap(value,res1 + '.'+key, www )
	}
      }else{
	//console.log("--key:"+res1)
	//if(res1.endsWith('text')){
	//    console.log(www)
	//}
	return
	//res.push(res1 + '.' + www)
      }
    }
    
    origin(result.svg.g)
    // 去除重复和字符
    let res1 = [...new Set(res)];
    //console.log(res1);
    const TextToSVG = require('text-to-svg');
    const textToSVG = TextToSVG.loadSync(__dirname+'/sc.otf'); // simplified chinese
    // 得到字符的path
    for(ii in res1){
      let uchar=res1[ii]
      let upath=charpath(textToSVG, uchar)
      result.svg.defs[0].path.push({'$':{
	id:'u'+uchar.charCodeAt(0).toString(16),
	d:upath['d']
      }})
      console.log(res1[ii])
    }

    var builder = new xml2js.Builder({headless:true});
    var xml = builder.buildObject(result);
    // xml 中是新的svg buffer
    callback(err, xml)
    //fs.writeFileSync("c.svg", xml)
  });
}


try{
  var svg2png = require("sharp");
  var mjpng=1
  // console.log(svg2png)
}catch(err){
  console.log("-- no sharp module, svg2png is not functioned.")
  var mjpng=0
}

var mjax=require('mathjax')

// callback(error, output)
//   error 不为 null ， 表示失败， output 中是http错误信息
//   error 为 null , 表示成功， 按 output 的格式 输出
/*     const output = {
       'statusCode': 200,
       'headers':
       {
       'Content-Type': 'application/json'
       },
       'isBase64Encoded': false,
       'body': JSON.stringify(event),
       }
*/
// option {format:'png/jpeg', height:100}
var equ2pic = function(formula, option, callback){
  mjax.init({
    loader: {load: ['input/tex', 'output/svg']},
    svg: { fontCache: 'local'}
  }).then((MathJax)=>{
    const svg = MathJax.tex2svg(formula,
				//    {display: true}
			       );
    svgBuf = MathJax.startup.adaptor.innerHTML(svg);
    cn2path(svgBuf, (err, svgBuffer)=>{
      if(mjpng && option.format){
	//console.log("convert to png: ", svgBuffer)
	var height=100
	if(option.height){
	  height=option.height
	}
	var svg2png = require("sharp");
	if(option.format=='png'){
	  svg2png(Buffer.from(svgBuffer))
	    .resize({ height: height,
		      background: {r: 255, g: 255, b: 0, alpha: 0.5} })
	    .png()
	    .toBuffer()
	    .then( buffer => {
	      output = {
		'statusCode': 200,
		'headers': {
		  'Content-Type': 'image/png',
		  //'Transfer-Encoding': 'chunked'
		  //'Content-Transfer-Encoding': 'base64'
		},
		'isBase64Encoded': true,
		'body': buffer.toString('base64'),
		'buffer': buffer,
		'svg': svgBuf,
	      }
	      callback(null, output)
	    })
	    .catch(err =>{
	      console.log(err);
	      output = {
		'statusCode': 200,
		'headers':
		{
		  'Content-Type': 'text/text'
		},
		'isBase64Encoded': false,
		'body': err.message,
		'buffer': null,
		'svg': svgBuf,
	      }
	      callback(null, output)
	    });
	} else {
	  // save jpeg file
	  svg2png(Buffer.from(svgBuffer))
	    .resize({ height: height,
		      background: {r: 255, g: 255, b: 0, alpha: 0.5} })
	    .jpeg().flatten({ background: { r: 255, g: 255, b: 255 } })
	    .toBuffer()
	    .then( buffer => {
	      output = {
		'statusCode': 200,
		'headers': {
		  'Content-Type': 'image/jpeg',
		  //'Transfer-Encoding': 'chunked'
		  //'Content-Transfer-Encoding': 'base64'
		},
		'isBase64Encoded': true,
		'body': buffer.toString('base64'),
		'buffer': buffer,
		'svg': svgBuf,
	      }
	      callback(null, output)
	    })
	    .catch(err =>{
	      console.log(err);
	      output = {
		'statusCode': 200,
		'headers':
		{
		  'Content-Type': 'text/text'
		},
		'isBase64Encoded': false,
		'body': err.message,
		'buffer': null,
		'svg': svgBuf,
	      }
	      callback(null, output)
	    });
	}
      } else {
        // no module "sharp" , or output svg file
	output = {
	  'statusCode': 200,
	  'headers':
	  {
	    'Content-Type': 'image/svg+xml'
	  },
	  'isBase64Encoded': false,
	  'body': svgBuffer,
	}
	callback(null, output)
	//response.writeHead(200, {'Content-Type': 'image/svg+xml'})
	//response.end(svgBuffer)
      }
    })
  }).catch((e) => {
    console.error(e);
    
    output = {
      'statusCode': 200,
      'headers':
      {
	'Content-Type': 'text/text'
      },
      'isBase64Encoded': false,
      'body': e.message,
    }
    callback(1, output)
    //response.end(e.message)
  });
}


// convert text into svg path d
// callback(err, result)
var text2d = function(text, fontsize, callback){
  const TextToSVG = require('text-to-svg');
  const textToSVG = TextToSVG.loadSync(__dirname+'/sc.otf'); // simplified chinese fonts

  //var attributes = {fill: 'red', stroke: 'black'};
  var attributes = {};
  const options = {
    x: 0, y: 0,
    fontSize: fontsize,
    //anchor: 'top',
    attributes: attributes};

  const buf = textToSVG.getD(text, options);
  callback(null, {
    'statusCode': 200,
    'headers':
    {
      'Content-Type': 'text/text'
    },
    'isBase64Encoded': false,
    'body': buf+"\n"
  })
}

module.exports={
  parse: equ2pic,
  path: text2d,
}

/*

var equ = require('./equ2pic')
var equ2pic=equ.parse;
var text2d=equ.path

usage: 把 formula(latex equation) 变成 图片 (png or jpg or svg)
 parse(formula, {format: "png" or "jpg" or null, height: 300}, (err, result)=>{})
 其中 formula 是公式, 
result: {
      'statusCode': 200,
      'headers':
      {
	'Content-Type': 'text/text'
      },
      'isBase64Encoded': false,
      'body': e.message,
}

 把 text 中的文字按sc.otf字体，转换为svg。输出  svg path d 的值
 path(text, fontsize, (error, result)=>{})
*/

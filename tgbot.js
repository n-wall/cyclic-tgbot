// telegram bot by grammy

const { Bot, InputFile } = require("grammy");

// 创建一个 `Bot` 类的实例，并将你的 bot token 传给它。
const tgtoken="telegram.bot.token";
const bot = new Bot(process.env.TELEGRAM_TOKEN || tgtoken); // <-- 把你的 bot token 放在 "" 之间

// 你现在可以在你的 bot 对象 `bot` 上注册监听器。
// 当用户向你的 bot 发送消息时， grammY 将调用已注册的监听器。

// Handle the /yo command to greet the user
bot.command("yo", (ctx) => ctx.reply(`Yo ${ctx.from?.username}`));
// object..getOwnPropertyNames()
// https://grammy.dev/guide/basics
bot.command("hi", (ctx) => {
  ctx.reply(`Hello ${ctx.from?.username}`+`\n ${ctx.msg.text}`+"\n"+  ctx.msg.message_id)
});

bot.command("latex", (ctx) => {
    formula=ctx.msg.text.slice(6)
    console.log(`Hello ${ctx.from?.username} , ${ctx.msg.message_id} \n`
	      +`\n latex fomula:  ${formula}`+"\n")
    var latex = require('./latex/equ2pic')
    var equ2pic=latex.parse;
    equ2pic(formula, {format: 'png', height: 100},
	    (err, result)=>{
		if(err){
		    ctx.reply(`Error: ${result.body}`)
		} else {
		    if(result.buffer){ // png file
			ctx.replyWithPhoto(new InputFile(result.buffer, "equ.png"), {caption: `Hello ${ctx.from?.username} , ${ctx.msg.message_id} \n`})
		    } else { // svg file
			ctx.replyWithDocument(new InputFile(result.body, "equ.svg"), {caption: `Hello ${ctx.from?.username} , ${ctx.msg.message_id} \n`})
		    }
		}
	    })
});


// 处理 /start 命令。

// Handle all other messages and the /start command
const introductionMessage = `Hello! I'm a Telegram bot.
I'm powered by Cyclic, the next-generation serverless computing platform.

<b>Commands</b>
/yo - Be greeted by me
/hi - say hi
/effect [text] - Show a keyboard to apply text effects to [text]`;

const replyWithIntro = (ctx) =>
  ctx.reply(introductionMessage, {
    //reply_markup: aboutUrlKeyboard,
    parse_mode: "HTML",
  });

bot.command("start", replyWithIntro);
// bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

bot.on(":audio", (ctx) =>{
  var ids=`[${ctx.msg.message_id}, ${ctx.msg.chat.id}]\n`
  var mp3=ctx.msg.audio
  var audinfo=`时长: ${mp3.duration} \n 歌名: ${mp3.title} 
fileID: ${mp3.file_id}
文件名: ${mp3.file_name}`
  ctx.reply(ids+audinfo)
})

// 消息中包含了一个文件，消息种类中有: phpto, document, video, audio 等
bot.on(":file", (ctx) =>{
  ctx.reply(JSON.stringify(ctx.msg, null, "  "))
/*  ctx.reply(`file: ${ctx.msg.document.file_id}
file name: ${ctx.msg.document.file_name}`)
//*/
});

// 处理其他的消息。
bot.on("message", (ctx) => {
  //console.log("got another message");
  console.log(JSON.stringify(ctx.msg, null, "  "));
  ctx.reply("Got another message!")
});

// 现在，你已经确定了将如何处理信息，可以开始运行你的 bot。
// 这将连接到 Telegram 服务器并等待消息。

module.exports=bot
// 启动 bot。
//bot.start();

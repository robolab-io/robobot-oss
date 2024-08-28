/* Sends an image of the MechaKeys leader board to discord */
const Discord = require('discord.js');
const { profile } = require('console');
const client = new Discord.Client();

const axios = require('axios')
const Jimp = require('jimp');


async function insertText(text, x=0, y=0, scale=1, color='#000', {image, width, height, font}) {
  var [scaledW, scaledH] = [(width / scale), (height / scale)]
  var textImage = await new Jimp(scaledW, scaledH, 0x0)
  textImage = await textImage.print(font, 0,  0, {
    text,
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
  }, scaledW, scaledH)
  textImage.color([{ apply: 'xor', params: [color] }]); // black text
  textImage.resize(width, height)

  image.composite(textImage, x, y);
  return image
}

async function shadowText(text, x, y, scale, color=['#000', '#fff'], offset=3, imgObj = {image, width, height, font}) {

  var [x,y] = [x+offset, y+offset]
  imgObj.image = await insertText(text, x, y, scale, color[0], imgObj)

  var [x,y] = [x-offset, y-offset]
  imgObj.image = await insertText(text, x, y, scale, color[1], imgObj)
  
  return imgObj
}



async function mcDeath(user="Halu", flavor="Halu Fell From A High Place", score="0") {
// Get Leaders JSON
  //const {data} = await axios.get('https://dn3zaz4bpiqrh.cloudfront.net/?action=getWeeklyLeaders')
// Build Field Arrays
  //const leadersArr = data.leaders.slice(0,25).map(obj => {return {'uid': obj.username, 'ks': obj.keystrokes}})

// Build IMG
  const font = await Jimp.loadFont('./bot/static/minecraft_font.fnt')
  var image = await Jimp.read('./bot/static/mcdeath.png')
  var [width, height] = [image.bitmap.width, image.bitmap.height] //  dimensions of the image
  var imgObj = {image, width, height, font}
  console.log(imgObj)


  //var text = "Halu died!"
  /*var [x,y] = [3, -200+3]
  scale = 1.6
  imgObj.image = await insertText(text, x, y, scale, '#000', imgObj)

  var [x,y] = [-3, -200-3]
  scale = 1.6
  image = await insertText(text, x, y, scale, '#fff', imgObj)*/

  
  var text = `${user} died!`
  var scale = 1.6
  var [x,y] = [0, -200]
  imgObj = await shadowText(text, x, y, scale, color=['#000', '#fff'], offset=6, imgObj = {image, width, height, font})


  scale = 0.85
  var [x,y] = [-6, -130]
  imgObj = await shadowText(flavor, x, y, scale, color=['#000', '#fff'], offset=3, imgObj = {image, width, height, font})


  text = "Score:"
  scale = 0.85
  var [x,y] = [-6, -85]
  imgObj = await shadowText(text, x, y, scale, color=['#000', '#fff'], offset=3, imgObj = {image, width, height, font})


  scale = 0.85
  var [x,y] = [65, -85]
  imgObj = await shadowText(score, x, y, scale, color=['#000', '#ffff5a'], offset=3, imgObj = {image, width, height, font})



  //var [x,y] = [340, -37]
  /*var textBG = await new Jimp(300, 300, 0x0)
  textBG = await textBG.print(font, 100, 100, text)
  textBG.color([{ apply: 'xor', params: ['#000'] }]); // black text
  textBG.resize(480, 480)*/
  


  /*var textImage = await new Jimp(300, 300, 0x0)
  textImage = await textImage.print(font, 100, 100, text)
  textImage.color([{ apply: 'xor', params: ['#fff'] }]); // white text
  textImage.resize(480, 480)

  //image.blit(textBG, x+7, y+7);
  image.composite(textImage, x, y);*/
  
  console.log('done')
  return imgObj.image.write('./bot/static/output.png')
}

client.on('ready', async () => {
  /* init leaderboard get interval */
  leaderBoard()
  //var timeout = client.setInterval(leaderBoard, 30 * 6e4)
})

client.on('message', async function(msg) {
 /* Shows leader board of mechakeys in discord. */
  var leaderMatch = msg.content.match(/^>plzkillme/)
  if(leaderMatch) {
    msg.channel.send(
      {files: ['./bot/static/output.png']}
    );
  }
})

const { TOKEN } = require("robo-bot-utils")
client.login(TOKEN)

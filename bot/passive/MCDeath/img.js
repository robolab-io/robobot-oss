const Jimp = require('jimp');

async function insertText(text, x=0, y=0, scale=1, color='#000', {image, width, height, font}) {
  // Might break if (image/scale) is smaller than font size... Pad or upscale og
  // Print colored text to new image, then insert into og
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
  // Insert Shadow
  var [x,y] = [x+offset, y+offset]
  imgObj.image = await insertText(text, x, y, scale, color[0], imgObj)
  // Insert desired color
  var [x,y] = [x-offset, y-offset]
  imgObj.image = await insertText(text, x, y, scale, color[1], imgObj)
  
  return imgObj
}

const conf = {
  mcdeath: {
    Title: [1.6, [0, -200], 6],
    Flavor: [ 0.85, [-6, -130], 3],
    ScoreLabel: [ 0.85, [-6, -85],3],
    ScoreValue: [ 0.85, (score)=>[70+(15*((score.length / 2)|0)+1), -85], 3]
  },
  mcdeathCrop:  {
    Title: [1.6, [0, -200], 6],
    Flavor: [ 0.85, [0, -100], 3],
    ScoreLabel: [ 0.85, [-6, -20],3],
    ScoreValue: [ 0.85, (score)=>[70+(15*((score.length / 2)|0)+1), -20], 3]
  },
  mcdeathSmall: {
    Title: [.85, [0, -130], 4],
    Flavor: [ 0.4, [-6, -80], 2],
    ScoreLabel: [ 0.4, [-6, -50], 2],
    ScoreValue: [ 0.4, (score)=>[25+(12*((score.length / 2)|0)+1), -50], 2]
  },
  mcdeathCropSmall:  {
    Title: [.85, [0, -100], 4],
    Flavor: [ 0.4, [0, -50], 2],
    ScoreLabel: [ 0.4, [-6, -10], 2],
    ScoreValue: [ 0.4, (score)=>[20+(10*((score.length / 2)|0)+1), -10], 2]
  }
}

// Init GLobal Const
var font; //, image;
(async () => {
  font = await Jimp.loadFont('./bot/static/minecraft_font.fnt')
  //image = await Jimp.read('./bot/static/mcdeath.png')
})()

async function mcDeathImg(user="Halu", flavor="Halu Fell From A High Place", score="0", v=3) {
  // Init Const
  const version = ['mcdeath', 'mcdeathCrop', 'mcdeathSmall', 'mcdeathCropSmall'][v]
  var image = await Jimp.read(`./bot/static/${version}.png`)
  var [width, height] = [image.bitmap.width, image.bitmap.height] //  dimensions of the image
  var imgObj = { image, width, height, font }
  
  // Title
  var text = `${user} died!`
  var [scale, [x,y], offset ]= conf[version].Title
  imgObj = await shadowText(text, x, y, scale, color=['#000', '#fff'], offset, imgObj = {image, width, height, font})

  // Flavor
  var [scale, [x,y], offset ]= conf[version].Flavor
  imgObj = await shadowText(flavor, x, y, scale, color=['#000', '#fff'], offset, imgObj = {image, width, height, font})

  // Score Label
  text = "Score:"
  var [scale, [x,y], offset ]= conf[version].ScoreLabel
  imgObj = await shadowText(text, x, y, scale, color=['#000', '#fff'], offset, imgObj = {image, width, height, font})

  // Score Value
  var [scale, f, offset ]= conf[version].ScoreValue
  var [x,y] = f(score)
  imgObj = await shadowText(score, x, y, scale, color=['#000', '#ffff5a'], offset, imgObj = {image, width, height, font})

  // Output New Image
  console.log('Killed someone')
  return await imgObj.image.getBufferAsync(Jimp.AUTO);
  //imgObj.image.write('../static/output.png')
}

module.exports.mcDeathImg = mcDeathImg
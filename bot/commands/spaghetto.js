const axios = require('axios')
module.exports.spaghetto = async (msg) => {
  var { data: {data: {children: posts }}} = await axios.get('https://www.reddit.com/r/badcode.json')

  posts = posts.filter(p => p.data.url.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/)) //https://regexr.com/3g1v7
  const url = posts[Math.floor(Math.random() * posts.length)].data.url

  msg.channel.send(url)
}

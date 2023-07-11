const express = require("express")
const bodyParser = require("body-parser")

const app = express()
app.use(bodyParser.json())

module.exports = (client)=>{
  const { init, logs } = require("./bot/apiLog")(app, client)
  init()
  logs()
}
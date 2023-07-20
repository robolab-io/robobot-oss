const { static } = require("robo-bot-utils");
const { panelOpenings, riddles } = static.flavors.bombsquad

const generateRiddle = () => {
  let riddle = riddles[Math.floor(Math.random() * riddles.length)]
  return {question: riddle.question.length > 1 ? riddle.question[Math.floor(Math.random() * riddle.question.length)] : riddle.question, answer: riddle.answer}
}

const wires = [ '🟩','🟥','🟦' ]

const generatePanel = () => {
  let panel = panelOpenings[Math.floor(Math.random() * panelOpenings.length)]
  return {question: panel.question[Math.floor(Math.random() * panel.question.length)], answer: panel.answer}
}
const generateKeycode = () => {
  const code = `${Math.floor(1000 + Math.random() * 9000)}`
  const codeHint = [...new Set(code.split('').sort())]
  return {
    code, codeHint
  }
}

module.exports={
  generateRiddle,
  wires,
  generatePanel,
  generateKeycode
}
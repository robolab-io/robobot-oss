const { exec } = require("child_process");

function bashReturn(output) {
  return `\`\`\`Bash\n${output}\n\`\`\``
}

module.exports.mkExec = (msg, { args }) => {
  const code = args.join(" ")
  if (!code) {
    return msg.channel.send("Oh")
  }

  exec(code, (error, stdout, stderr) => {
    const input = bashReturn(code)
    if (error) {
      let output = bashReturn(error)
      msg.channel.send(input, { split: true })
      return msg.channel.send(output, { split: true })
    } else {
      const output = stderr || stdout;
      const output2 = bashReturn(output)
      msg.channel.send(output2, { split: true })
    }
  })
}

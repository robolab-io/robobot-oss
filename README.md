# Robo-Bot 🤖

The public source code release for Robo-bot, the MechaKeys Discord bot.

<br/>

## Architecture

This repo follows a pretty standard Discord.js v14 organization, with most functionality/interactions being under `bot/commands`.

90% of the bots code is accessible here, the remaining 10% is locked behind an optional dependency. The hidden content is mostly private api endpoints and flavor text that we feel revealing would undermine the enjoyment of their associated utility.

The bot is hosted on Heroku (💀 we know). Due to the barriers of using private submodules without leaking secrets, we have opted for an optional private dependency ([which heroku supports](https://stackoverflow.com/a/64645458)) and a [meta repo](https://github.com/mateodelnorte/meta). Heroku grabs the latest semver release of the private utils, this means you must push a new tag to remote in order to run changes there. Because this is terrible DX (having to reinstall the dep to test changes), the meta repo allows us to run a local copy of the utils repo in order to test things quickly. The three ways of resolving this repo (private node dep, local meta repo, mock export) is handled by `robo-bot-utils/index.js`.

<br/>

## Getting Started

### Robolab member:
Install
```sh
# This will also install & setup our private utils
npm i -g meta
meta git clone https://github.com/robolab-io/robobot-oss.git
meta npm install
```

Run
```sh
# Runs bot locally with remote utils as defined by package.json
npm run dev # might need to npm update to ensure its up to date

# Runs bot locally with local utils 
npm run meta # make sure utils is on the right branch
```

Dev snippets
```sh
# Set just the utils branch
meta git checkout someBranch --include-only robo-bot-utils/src
```


#### DX
1. **vscode git-graph extension:** `ctrl+shift+p` and run `>Git Graph: Add Git Repository...` for each sub-repo. This will let you easily toggle between them.
2. **VSCode Source Control Tab:** click on the three dots for options => Views => Source Control Repositories. This will let you select the sub-repo whose diffs you wish to see.

<br/>

### Unaffiliated Developer:
Install
```sh
git clone https://github.com/robolab-io/robobot-oss.git
npm i
```

Run
```sh
# Will likely fail without our private utils
npm run dev
```

const users = {
	// all caps
	HALU: '216317706591272971',
	ROBO: '384862194246090760',
	HYPERION: '924621655345627196',
};


const roles = {
	Role_Everyone: '462274708499595264',

	// Staff
	Role_PP: '774366277329485844',
	Role_Robo: '732591347877281952',

	Staff_Admin: '1034830726748708914',     // Admin server perms
	Staff_Admin_CMDS: '730440161619607554', // Admin bot perms (cmd accumulator)
	Staff_Mod: '910623335069655101',        // Mod
	Staff_Helper: '763876223364628480',     // min bot-perms

	// Patrons
	Role_Booster: '675783015238074369',  // server boosters get fixed keycap reward
	Role_Donator: '745750711584948316',  // 2x xp/rewards
	Role_Linked: '766073171135692830',

	// Status
	Status_Dead: '774064350540464139',
	Status_Ghost: '777572793638191165',
	Status_Boost: '812464225548369951',  // 2x xp/rewards

	// Levels
	Level_3:  '777737594452181002',
	Level_10: '773216593173413938',
	Level_15: '774510419741245440',
	Level_20: '773294691894034472',
	Level_30: '809803444009172992',
	Level_40: '851550484888420382',

	// Store items
	Item_bodyguards: '811255216128786503',
	Item_flyingfist: '939774831220633600',
	Item_fistofdoom: '865711992785731614'
}

const channels = {
	// Public Channels
	ch_bots: '759098989554958387',
	ch_general: '462274708499595266',
	ch_graveyard: '774338256112058398',
	ch_giveaways: '771448471625400351',

	// Server Mod
	ch_rules: '1038517943702655056',
	ch_serverAnnounce: '745124557119291482',
	ch_mechaUpdates: '730446085780144210',
	ch_linkChannel: '1114449640348205057',

	// Staff Private
	dev_feed: '752348032145686599',
	dev_bot: '751665008869376010',
	log_api: '771724978264604682',
	log_interactions: '945055759824207962'
}

const categories = {
	cat_staff: '777796388649304064',
	cat_dev: '1051738062482317402',
	cat_public: '813591877159747592',
	cat_important: '813590563219308544',
	cat_logs: '770113829433507841',
}

const { isDev } = require('robo-bot-utils');
let [DEV_ID, PROD_ID] = [ '752405174722756718', '747491742214783117' ]
const other = {
  SERVER_ID: '462274708499595264',
	DEV_ID,
	PROD_ID,
  CLIENT_ID: isDev ? DEV_ID : PROD_ID
}

module.exports = {
	...other,
	...users,
	...roles,
	...channels,
	...categories
}

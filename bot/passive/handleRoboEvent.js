// This pretty much just does two things
// 1.Catches activeUsers before it starts
// 2.And passes through the msg event to roboEvents
module.exports = async (client, msg) => {
	if (!client.robo_events[msg.channel.id] || !client.robo_events[msg.channel.id].active) { return; }
	const evO = client.robo_events[msg.channel.id];
	evO.activeUsers.push(msg.author.id);
	if (evO.startTime > (Date.now() - evO.preWatchTime)) { return; } // do nothing else yet, just store active users
	if (evO.ending) return; // ending, too late! gotteem
	if (evO.msgTrigger) { evO.msgTrigger(msg, evO); }
};

/* EZ-Emote plugin
 * These are commands that make 
 * it easier for people to actually 
 * emotes without having to manaully
 * add them every time
 * By: panpawn (inspired by jd's ez-tc plugin)
 */
 
 var fs = require('fs');
 var serialize = require('node-serialize');
 var emotes = {};
 
 function loadEmotes() {
	try {
		emotes = serialize.unserialize(fs.readFileSync('config/emotes.json', 'utf8'));
		Object.merge(Core.emoticons, emotes);
	} catch (e) {};
}
setTimeout(function(){loadEmotes();},1000);

function saveEmotes() {
	try {
		fs.writeFileSync('config/emotes.json',serialize.serialize(emotes));
		Object.merge(Core.emoticons, emotes);
	} catch (e) {};
}

exports.commands = {
	ec: 'ezemote',
	ezemote: function (target, room, user) {
		if (!target) target = 'help';
		var parts = target.split(',');
		for (var u in parts) parts[u] = parts[u].trim();
		try {
			switch (parts[0]) {
				case 'add':
					if (!this.can('pban')) return this.sendReply("Access denied.")
					if (!parts[2]) return this.sendReply("Usage: /ezemote add, [emote], [link]");
					var emoteName = parts[1];
					if (Core.emoticons[emoteName]) return this.sendReply("ERROR - the emote: " + emoteName + " already exists.");
					var link = parts.splice(2, parts.length).join(',');
					emotes[emoteName] = Core.emoticons[emoteName] = link;
					saveEmotes();
					this.sendReply("The emote " + emoteName + " has been added.");
					this.logModCommand(user.name + " added the emote " + emoteName);
					Rooms.rooms.staff.add(user.name + " added the emote " + emoteName);
					break;
				case 'rem':
				case 'remove':
				case 'del':
				case 'delete':
					if (!this.can('pban')) return this.sendReply("Access denied.");
					if (!parts[1]) return this.sendReplyBox('/ezemote remove, [emote]');
					var emoteName = parts[1];
					if (!Core.emoticons[emoteName]) return this.sendReplyBox("ERROR - the emote: " + emoteName + " does not exist.");
					delete Core.emoticons[emoteName];
					delete emotes[emoteName];
					saveEmotes();
					this.sendReply("The emote " + emoteName + " was removed.");
					this.logModCommand("The emote " + emoteName + " was removed by " + user.name);
					Rooms.rooms.staff.add("The emote " + emoteName + " was removed by " + user.name);
					break;
				case 'list':
					if (!this.canBroadcast()) return;
					var output = "<b>There's a total of " + Object.size(emotes) + " emotes added with this command:</b><br />";
					for (var e in emotes) {
						output += e + "<br />";
					}
					this.sendReplyBox(output);
					break;
				case 'help':
				default:
					if (!this.canBroadcast()) return;
					this.sendReplyBox(
						"EZ-Emote Commands:<br />" +
						"/ezemote add, [emote], [link] - Adds an emote. Requires &, ~.<br />" +
						"/ezemote remove, [emote] - Removes an emote. Requires &, ~.<br />" +
						"/ezemote list - Shows the emotes that were added with this command.<br />" +
						"/ezemote help - Shows this help command.<br />"
					);
			}
		} catch (e) {};
	}
};
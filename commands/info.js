const { MessageEmbed } = require("discord.js");

exports.run = async (client, message, args) => { // eslint-disable-line no-unused-vars
  const dev = client.users.resolve(client.config.botOwner).tag;
  const artist = client.users.resolve("401980971517214723").tag;
  const infoEmbed = new MessageEmbed()
    .setAuthor("esmBot Info/Credits", "https://cdn.discordapp.com/avatars/429305856241172480/49717613bd5c8302e59f615f5ef70fe5.png")
    .setColor(0xFF0000)
    .addField("📝 Credits:", `Bot by **${dev}**\n` +
      `Icon by **${artist}**`)
    .addField("👪 Total Users:", client.users.size)
    .addField("💬 Total Servers:", client.guilds.size)
    .addField("✅ Official Server:", "https://discord.gg/QPRhesx")
    .addField("💻 Source Code:", "https://github.com/District69/D69bot");
  message.channel.send(infoEmbed);
};

exports.aliases = ["botinfo", "credits"];

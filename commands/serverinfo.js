const { MessageEmbed } = require("discord.js");

exports.run = async (client, message, args) => { // eslint-disable-line no-unused-vars
  message.guild.members.fetch(message.guild.ownerID).then((member) => {
    const serverEmbed = new MessageEmbed()
      .setTitle(message.guild.name)
      .setThumbnail(message.guild.iconURL({ size: 1024 }))
      .setColor(0xFF0000)
      .setDescription(`🔢 **ID:** \`${message.guild.id}\`\n` +
        `👤 **Owner:** ${member.user.username}#${member.user.discriminator}\n` +
        `🗺️ **Region:** ${message.guild.region}\n` +
        `🗓️ **Created on:** \`${message.guild.createdAt}\`\n` +
        `👥 **Users:** ${message.guild.memberCount}\n` +
        `💬 **Channels:** ${message.guild.channels.size}\n` +
        `😃 **Emojis:** ${message.guild.emojis.map(e => e).join("")}`);
    return message.channel.send(serverEmbed);
  }).catch((error) => { throw new Error(error); });
};

exports.aliases = ["server"];

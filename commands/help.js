exports.run = async (client, message, args) => { // eslint-disable-line no-unused-vars
  const guildConf = client.settings.get(message.guild.id) || client.defaults;
  message.reply(`my command list can be found here: <https://bot.district69.rocks/d69bot/commands.html>\nThis server's prefix is \`${guildConf.prefix}\`.`);
};

exports.aliases = [];

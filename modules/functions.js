const request = require("request-promise-native").defaults({ encoding: null });
const imageCheck = require("image-type");

module.exports = (client) => {
  client.loadCommand = (commandName) => {
    try {
      client.logger.log(`Loading Command: ${commandName}. 👌`);
      const props = require(`../commands/${commandName}`);
      if (props.init) {
        props.init(client);
      }
      client.commands.set(commandName, props);
      props.aliases.forEach(alias => {
        client.aliases.set(alias, commandName);
      });
      return false;
    } catch (e) {
      return `Unable to load command ${commandName}: ${e}`;
    }
  };

  client.unloadCommand = async (commandName) => {
    let command;
    if (client.commands.has(commandName)) {
      command = client.commands.get(commandName);
    } else if (client.aliases.has(commandName)) {
      command = client.commands.get(client.aliases.get(commandName));
    }
    if (!command) return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;
    if (command.shutdown) {
      await command.shutdown(client);
    }
    const mod = require.cache[require.resolve(`../commands/${commandName}`)];
    delete require.cache[require.resolve(`../commands/${commandName}.js`)];
    for (let i = 0; i < mod.parent.children.length; i++) {
      if (mod.parent.children[i] === mod) {
        mod.parent.children.splice(i, 1);
        break;
      }
    }
    return false;
  };

  // <String>.toPropercase() returns a proper-cased string such as:
  // "Mary had a little lamb".toProperCase() returns "Mary Had A Little Lamb"
  String.prototype.toProperCase = function() {
    return this.replace(/([^\W_]+[^\s-]*) */g, function(txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
  };

  // <String>.toFullWidth() returns a fullwidth string such as:
  // "Mary had a little lamb".toFullWidth() returns "Ｍａｒｙ ｈａｄ ａ ｌｉｔｔｌｅ ｌａｍｂ"
  String.prototype.toFullWidth = function() {
    return this.replace(/[A-Za-z0-9]/g, function(s) { return String.fromCharCode(s.charCodeAt(0) + 0xFEE0); });
  };

  // <Array>.random() returns a single random element from an array
  // [1, 2, 3, 4, 5].random() can return 1, 2, 3, 4 or 5
  Array.prototype.random = function() {
    return this[Math.floor(Math.random() * this.length)];
  };

  // `await client.wait(1000);` to "pause" for 1 second
  client.wait = require("util").promisify(setTimeout);

  // `client.clean(client, text)` to remove pings and tokens
  client.clean = async (client, text) => {
    if (text && text.constructor.name == "Promise")
      text = await text;
    if (typeof evaled !== "string")
      text = require("util").inspect(text, { depth: 1 });

    text = text
      .replace(/`/g, `\`${String.fromCharCode(8203)}`)
      .replace(/@/g, `@${String.fromCharCode(8203)}`)
      .replace(client.token, "<redacted>")
      .replace(client.config.mashapeKey, "<redacted>")
      .replace(client.config.catToken, "<redacted>")
      .replace(client.config.googleKey, "<redacted>")
      .replace(client.config.cseID, "<redacted>")
      .replace(client.config.dblToken, "<redacted>");

    return text;
  };

  // `client.regexEscape(string);` to escape characters in a string for use with a regex
  client.regexEscape = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  };

  // `client.getImage(message);` to get the last uploaded image in a channel
  client.getImage = (message) => {
    return new Promise(async (resolve, reject) => {
      // get list of messages in channel
      const messageList = message.channel.messages.sort(function(a, b) {
        return b.createdTimestamp - a.createdTimestamp;
      }).array();
      let attachmentFound = false;
      for (const messageCheck of messageList) {
        if (messageCheck.attachments.array().length !== 0) {
          const attachmentsList = messageCheck.attachments.array();
          // check if file is an image or not
          const image = await request(attachmentsList[0].url);
          // await client.wait(500);
          const imageType = imageCheck(image);
          await client.wait(500);
          if (["jpg", "png", "webp"].includes(imageType.ext)) {
            attachmentFound = true;
            resolve(attachmentsList[0].url);
          }
        } else if (messageCheck.embeds.length !== 0) {
          if (messageCheck.embeds[0].thumbnail) {
            const embedsList = messageCheck.embeds;
            // check if file is an image or not
            const image = await request(embedsList[0].thumbnail.url);
            // await client.wait(500);
            const imageType = imageCheck(image);
            await client.wait(500);
            if (["jpg", "png", "webp"].includes(imageType.ext)) {
              attachmentFound = true;
              resolve(embedsList[0].thumbnail.url);
            }
          } else if (messageCheck.embeds[0].image) {
            const embedsList = messageCheck.embeds;
            // check if file is an image or not
            const image = await request(embedsList[0].image.url);
            // await client.wait(500);
            const imageType = imageCheck(image);
            await client.wait(500);
            if (["jpg", "png", "webp"].includes(imageType.ext)) {
              attachmentFound = true;
              resolve(embedsList[0].image.url);
            }
          }
        }
      }
      if (!attachmentFound) {
        reject("Attachment not found");
      }
    });
  };

  // `client.playSound(sound, message);` to play a sound in voice chat
  client.playSound = async (sound, message) => {
    if (message.member.voice.channel) {
      if (!message.guild.me.permissions.has("CONNECT") || !message.member.voice.channel.permissionsFor(message.guild.me).has("CONNECT")) return message.reply("I can't join this voice channel!");
      const voiceChannel = message.member.voice.channel;
      message.channel.send("🔊 Playing sound...");
      const connection = await voiceChannel.join();
      const dispatcher = connection.play(require("fs").createReadStream(sound), {
        type: "ogg/opus"
      });
      dispatcher.on("error", () => {
        voiceChannel.leave();
        console.error;
      });
      dispatcher.on("finish", () => {
        dispatcher.destroy();
        voiceChannel.leave();
      });
    } else {
      message.channel.send("You need to be in a voice channel first!");
    }
  };

  process.on("uncaughtException", (err) => {
    const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
    client.logger.error(`Uncaught Exception: ${errorMsg}`);
    process.exit(1);
  });

  process.on("unhandledRejection", (err) => {
    client.logger.error(`Unhandled rejection: ${err}`);
  });
};

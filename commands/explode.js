const request = require("request");
const gm = require("gm").subClass({
  imageMagick: true
});

exports.run = async (client, message, args) => { // eslint-disable-line no-unused-vars
  const image = await client.getImage(message).catch(error => {
    message.reply("you need to provide an image to explode!");
    console.log(error);
  });
  if (image !== undefined) {
    message.channel.startTyping();
    gm(request(image)).implode([-2]).strip().stream((error, stdout) => {
      if (error) throw new Error(error);
      message.channel.stopTyping();
      message.channel.send({
        files: [{
          attachment: stdout,
          name: "explode.png"
        }]
      });
    });
  }
};

exports.aliases = ["exp"];

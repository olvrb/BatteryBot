const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
var request = require('request');
var fs = require('fs');
var Jimp = require("jimp");
const ocrSpaceApi = require('ocr-space-api');

var options =  { 
    apikey: 'webocr5',
    language: 'eng', // Português
    imageFormat: 'image/png', // Image Type (Only png ou gif is acceptable at the moment i wrote this)
    isOverlayRequired: true
};
client.on("ready", () => {
    console.log("Started.");
});
ready:
client.on("message", async message => {
    if (message.author.bot || !message.attachments.first()) return;
    const url = message.attachments.first().url;
    var filename = `${makeid()}.png`;
    var writeFile = fs.createWriteStream("./downloads/" + filename)

    request(url).pipe(writeFile).on('close', async function () {
        console.log(url, 'saved to', filename)
        
        Jimp.read("./downloads/" + filename, function (err, image) {
            if (err) throw err;
            image.crop(946, 13, 282, 59)
                .write("./downloads/" + filename); // save 
        });
        setTimeout(() => {
            ocrSpaceApi.parseImageFromLocalFile(`./downloads/${filename}`, options).then(resp => {
                console.log(resp.parsedText.trim().replace("%", "").replace(/\D/g,''));
                let batt;
                try {
                    batt = parseInt(resp.parsedText.trim().replace("%", "").replace(/\D/g,''));
                } catch (error) {
                    throw error;
                }
                if (!(batt > 25)) {
                    message.reply("Charge your phone! Your battery percentage is below 25%.");
                }
            }).catch(function (err) {
                message.channel.send("API is not responding. Please report this to @oliver#9880");
            });
        }, 1e3);

    });
});

client.login(config.token);


function makeid() {
    var fs = require('fs');
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const files = fs.readdirSync("./");
    for (var i = 0; i < 10; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    if (files.includes(text + ".png")) {
        text = "";
        text = makeid();
    }
    return text;
}
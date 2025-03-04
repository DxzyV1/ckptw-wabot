const api = require("./api.js");
const axios = require("axios");
const cheerio = require("cheerio");
const didyoumean = require("didyoumean");
const FormData = require("form-data");
const {
    fromBuffer
} = require("file-type");
const Jimp = require("jimp");

async function checkAdmin(ctx, id) {
    try {
        const members = await ctx.group().members();
        return members.some((m) => (m.admin === "superadmin" || m.admin === "admin") && m.id === id);
    } catch (error) {
        console.error(`[${config.pkg.name}] Error:`, error);
        return false;
    }
}

async function blurredImage(input) {
    try {
        let image;

        const universalUrl = /((https?):\/\/)?(www\.)?[a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i;
        if (typeof input === "string" && universalUrl.test(input)) {
            const response = await axios.get(input, {
                responseType: "arraybuffer"
            });
            image = await Jimp.read(Buffer.from(response.data));
        } else if (Buffer.isBuffer(input)) {
            image = await Jimp.read(input);
        } else {
            throw new Error("Invalid input type. Input should be a URL or a Buffer.");
        }

        const canvasWidth = 115;
        const canvasHeight = 90;
        const aspectRatio = canvasWidth / canvasHeight;
        const imageAspectRatio = image.bitmap.width / image.bitmap.height;

        let newWidth, newHeight;

        if (imageAspectRatio > aspectRatio) {
            newWidth = canvasWidth;
            newHeight = canvasWidth / imageAspectRatio;
        } else {
            newWidth = canvasHeight * imageAspectRatio;
            newHeight = canvasHeight;
        }

        const blurredImage = image.clone().resize(canvasWidth + 40, canvasHeight + 40).blur(50);

        const finalImage = new Jimp(canvasWidth, canvasHeight);

        finalImage.composite(blurredImage, -20, -20);

        const xOffset = (canvasWidth - newWidth) / 2;
        const yOffset = (canvasHeight - newHeight) / 2;

        finalImage.composite(image.resize(newWidth, newHeight), xOffset, yOffset);

        const buffer = await finalImage.getBufferAsync(Jimp.MIME_PNG);
        const url = await upload(buffer);

        return {
            buffer,
            url
        };
    } catch (error) {
        console.error(`[${config.pkg.name}] Error:`, error);
        return false;
    }
}

async function checkMedia(msgType, requiredMedia, ctx) {
    const mediaMap = {
        audio: "audioMessage",
        contact: "contactMessage",
        document: ["documentMessage", "documentWithCaptionMessage"],
        gif: "videoMessage",
        image: "imageMessage",
        liveLocation: "liveLocationMessage",
        location: "locationMessage",
        payment: "paymentMessage",
        poll: "pollMessage",
        product: "productMessage",
        ptt: "audioMessage",
        reaction: "reactionMessage",
        sticker: "stickerMessage",
        text: () => ctx.args && ctx.args.length > 0,
        video: "videoMessage",
        viewOnce: "viewOnceMessageV2"
    };

    const mediaList = Array.isArray(requiredMedia) ? requiredMedia : [requiredMedia];

    return mediaList.some(media => {
        if (media === "document") {
            return mediaMap[media].includes(msgType);
        } else if (media === "text") {
            return mediaMap[media]();
        }
        return msgType === mediaMap[media];
    });
}

async function checkQuotedMedia(quoted, requiredMedia) {
    const quotedMediaMap = {
        audio: quoted.audioMessage,
        contact: quoted.contactMessage,
        document: quoted.documentMessage || quoted.documentWithCaptionMessage,
        gif: quoted.videoMessage,
        image: quoted.imageMessage,
        liveLocation: quoted.liveLocationMessage,
        location: quoted.locationMessage,
        payment: quoted.paymentMessage,
        poll: quoted.pollMessage,
        product: quoted.productMessage,
        ptt: quoted.audioMessage,
        reaction: quoted.reactionMessage,
        sticker: quoted.stickerMessage,
        text: quoted.conversation || quoted.extendedTextMessage?.text,
        video: quoted.videoMessage,
        viewOnce: quoted.viewOnceMessageV2
    };

    const mediaList = Array.isArray(requiredMedia) ? requiredMedia : [requiredMedia];

    return mediaList.some(media => {
        const mediaContent = quotedMediaMap[media];
        return media === "text" ? mediaContent && mediaContent.length > 0 : mediaContent;
    });
}

function convertMsToDuration(ms) {
    if (ms < 1000) return "kurang satu detik";

    try {
        const years = Math.floor(ms / (1000 * 60 * 60 * 24 * 365.25));
        const months = Math.floor((ms / (1000 * 60 * 60 * 24 * 30.44)) % 12);
        const weeks = Math.floor((ms / (1000 * 60 * 60 * 24 * 7)) % 4.345);
        const days = Math.floor((ms / (1000 * 60 * 60 * 24)) % 7);
        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const seconds = Math.floor((ms / 1000) % 60);

        let durationString = "";

        if (years > 0) durationString += years + " tahun ";
        if (months > 0) durationString += months + " bulan ";
        if (weeks > 0) durationString += weeks + " minggu ";
        if (days > 0) durationString += days + " hari ";
        if (hours > 0) durationString += hours + " jam ";
        if (minutes > 0) durationString += minutes + " menit ";
        if (seconds > 0) durationString += seconds + " detik";

        return durationString.trim();
    } catch (error) {
        console.error(`[${config.pkg.name}] Error:`, error);
        return null;
    }
}

function formatSize(byteCount) {
    if (byteCount === 0) return "0 Bytes";

    try {
        const units = ["Bytes", "KiB", "MiB", "GiB", "TiB"];
        const index = Math.floor(Math.log(byteCount) / Math.log(1024));
        const size = (byteCount / Math.pow(1024, index)).toFixed(2);
        return `${parseFloat(size)} ${units[index]}`;
    } catch (error) {
        console.error(`[${config.pkg.name}] Error:`, error);
        return null;
    }
}

function generateUID(phoneNumber) {
    if (typeof phoneNumber !== "string") {
        phoneNumber = phoneNumber.toString();
    }

    let hash = 0;
    for (let i = 0; i < phoneNumber.length; i++) {
        const charCode = phoneNumber.charCodeAt(i);
        hash = (hash * 31 + charCode) % 1000000007;
    }

    return "ckptw-" + Math.abs(hash).toString(16).toLowerCase();
}

function getRandomElement(arr) {
    if (arr.length === 0) return null;

    try {
        const randomIndex = Math.floor(Math.random() * arr.length);
        return arr[randomIndex];
    } catch (error) {
        console.error(`[${config.pkg.name}] Error:`, error);
        return null;
    }
}

function isCmd(m, ctx) {
    const prefixRegex = new RegExp(ctx._config.prefix, "i");
    const content = m.content && m.content.trim();

    if (!prefixRegex.test(content)) return false;

    try {
        const prefix = content.charAt(0);
        const [cmdName, ...inputArray] = content.slice(1).trim().toLowerCase().split(/\s+/);
        const input = inputArray.join(" ");

        const cmd = ctx._config.cmd;
        const listCmd = Array.from(cmd.values()).flatMap(command => {
            const aliases = Array.isArray(command.aliases) ? command.aliases : [];
            return [command.name, ...aliases];
        });

        const matchedCmd = cmd.get(cmdName) || Array.from(cmd.values()).find(c => c.aliases && c.aliases.includes(cmdName));

        if (matchedCmd) return {
            msg: content,
            prefix,
            cmd: cmdName,
            input
        };

        const mean = didyoumean(cmdName, listCmd);

        if (mean) return {
            msg: content,
            prefix,
            cmd: cmdName,
            input,
            didyoumean: mean
        };

        return false;

    } catch (error) {
        console.error(`[${config.pkg.name}] Error:`, error);
        return false;
    }
}

async function isAdmin(ctx, id) {
    try {
        const jid = id || ctx.sender.jid;
        return await checkAdmin(ctx, jid);
    } catch (error) {
        console.error(`[${config.pkg.name}] Error:`, error);
        return false;
    }
}

async function isBotAdmin(ctx) {
    try {
        const id = config.bot.id;
        return await checkAdmin(ctx, id);
    } catch (error) {
        console.error(`[${config.pkg.name}] Error:`, error);
        return false;
    }
}

function isOwner(ctx, id, selfOwner) {
    try {
        const number = id || ctx.sender.jid.split(/[:@]/)[0]
        return selfOwner ? config.bot.number === number || config.owner.number === number || config.owner.co.includes(number) : config.owner.number === number || config.owner.co.includes(number);
    } catch (error) {
        console.error(`[${config.pkg.name}] Error:`, error);
        return false;
    }
}

function isUrl(string) {
    if (typeof string !== "string") return false;

    const universalUrl = /((https?):\/\/)?(www\.)?[a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i;
    return universalUrl.test(string);
}

function parseFlag(argsString, customRules = {}) {
    if (!argsString || argsString.trim() === "") return false;

    const options = {};
    let input = [];

    const args = argsString.split(" ");

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        let isFlag = false;

        for (const flag in customRules) {
            if (arg === flag) {
                const rule = customRules[flag];
                isFlag = true;

                if (rule.type === "value") {
                    const value = args[i + 1];
                    if (value && rule.validator(value)) {
                        options[rule.key] = rule.parser(value);
                        i++;
                    }
                } else if (rule.type === "boolean") {
                    options[rule.key] = true;
                }
                break;
            }
        }

        if (!isFlag) {
            input.push(arg);
        }
    }

    options.input = input.join(" ");

    return options;
}

async function translate(text, to) {
    const apiUrl = api.createUrl("nyxs", "/tools/translate", {
        text,
        to
    });

    try {
        const {
            data
        } = await axios.get(apiUrl);
        return data.result;
    } catch (error) {
        console.error(`[${config.pkg.name}] Error:`, error);
        return null;
    }
}

function ucword(str) {
    try {
        return str.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase());
    } catch (error) {
        console.error(`[${config.pkg.name}] Error:`, error);
        return null;
    }
}

async function upload(buffer) {
    try {
        const {
            ext
        } = await fromBuffer(buffer);
        if (!ext) {
            throw new Error("Could not determine file type from buffer");
        }

        let form = new FormData();
        form.append("file", buffer, `tmp.${ext}`);

        const apiUrl = api.createUrl("https://uploader.nyxs.pw", "/upload", {});
        const response = await axios.post(apiUrl, form, {
            headers: {
                ...form.getHeaders()
            }
        });

        const $ = cheerio.load(response.data);
        const url = $("a").attr("href");

        if (!url) throw new Error("URL not found in response");

        return url;
    } catch (error) {
        console.error(`[${config.pkg.name}] Error:`, error);
        return null;
    }
}

module.exports = {
    blurredImage,
    checkMedia,
    checkQuotedMedia,
    convertMsToDuration,
    formatSize,
    generateUID,
    getRandomElement,
    isCmd,
    isAdmin,
    isBotAdmin,
    isOwner,
    isUrl,
    parseFlag,
    translate,
    ucword,
    upload
};
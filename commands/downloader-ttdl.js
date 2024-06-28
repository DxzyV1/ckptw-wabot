const {
    createAPIUrl
} = require("../tools/api.js");
const {
    bold,
    monospace
} = require("@mengkodingan/ckptw");
const fg = require("api-dylux");
const axios = require("axios");
const mime = require("mime-types");

module.exports = {
    name: "ttdl",
    aliases: ["tiktokdl", "tiktoknowm", "tt", "vt", , "vtdltiktok", "vtnowm"],
    category: "downloader",
    code: async (ctx) => {
        const handlerObj = await global.handler(ctx, {
            banned: true,
            coin: 3
        });

        if (handlerObj.status) return ctx.reply(handlerObj.message);

        const input = ctx._args.join(" ");
        if (!input) return ctx.reply(
            `${global.msg.argument}\n` +
            `Contoh: ${monospace(`${ctx._used.prefix + ctx._used.command} https://example.com/`)}`
        );

        const urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)\b/i;
        if (!urlRegex.test(input)) return ctx.reply(global.msg.urlInvalid);

        try {
            const sources = ["nyxs", "ngodingaja", "dylux"];
            let result;

            for (const source of sources) {
                result = await ttdl(source, input);
                if (result) break;
            } catch (error) {
                console.error(`Error from ${source}:`, error);
                continue;
            }

            if (!result) return ctx.reply(global.msg.notFound);

            return await ctx.reply({
                video: {
                    url: result
                },
                mimetype: mime.contentType("mp4"),
                caption: `❖ ${bold("TT Downloader")}\n` +
                    "\n" +
                    `➲ URL: ${input}\n` +
                    "\n" +
                    global.msg.footer,
                gifPlayback: false
            });
        } catch (error) {
            console.error("Error:", error);
            if (error.status !== 200) return ctx.reply(global.msg.notFound);
            return ctx.reply(`${bold("[ ! ]")} Terjadi kesalahan: ${error.message}`);
        }
    }
};

async function ttdl(source, url) {
    let result = null;

    switch (source) {
        case "nyxs":
            result = await axios.get(createAPIUrl("nyxs", "/dl/tiktok", {
                url
            })).then(response => response.data.result.musik || response.data.result.video_hd);
            break;
        case "ngodingaja":
            result = await axios.get(createAPIUrl("ngodingaja", "/api/tiktok", {
                url
            })).then(response => response.data.hasil.musik || response.data.result.video2 || response.data.result.video1 || response.data.hasil.tanpawm);
            break;
        case "dylux":
            result = await fg.tiktok(input).then(data => data.play || data.hdplay);
            break;
        default:
            throw new Error(`Unsupported source: ${source}`);
    }

    return result;
}
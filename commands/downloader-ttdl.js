const {
    monospace,
    quote
} = require("@mengkodingan/ckptw");
const mime = require("mime-types");
const fetch = require("node-fetch");

module.exports = {
    name: "ttdl",
    aliases: ["tiktokdl", "tiktokmp3", "tiktoknowm", "tt", "tta", "ttaudio", "ttmp3", "ttmusic", "ttmusik", "vt", "vta", "vtaudio", "vtdltiktok", "vtmp3", "vtmusic", "vtmusik", "vtnowm"],
    category: "downloader",
    code: async (ctx) => {
        const {
            status,
            message
        } = await global.handler(ctx, {
            banned: true,
            coin: 3
        });
        if (status) return ctx.reply(message);

        const url = ctx.args[0] || null;

        if (!url) return ctx.reply(
            `${quote(global.msg.argument)}\n` +
            quote(`Contoh: ${monospace(`${ctx._used.prefix + ctx._used.command} https://example.com/`)}`)
        );

        const urlRegex = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i;
        if (!urlRegex.test(url)) return ctx.reply(global.msg.urlInvalid);

        try {
            const audioCommands = ["tiktokmp3", "tta", "ttaudio", "ttmp3", "ttmusic", "ttmusik", "vta", "vtaudio", "vtmp3", "vtmusic", "vtmusik"];
            const mediaType = audioCommands.includes(ctx._used.command) ? "audio" : "video_image";

            const apiUrl = global.tools.api.createUrl("https://api.tiklydown.eu.org", "/api/download", {
                url
            });
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (mediaType === "audio") {
                return await ctx.reply({
                    audio: {
                        url: data.music.play_url
                    },
                    mimetype: mime.lookup("mp3")
                });
            }

            if (mediaType === "video_image") {
                if (data.video?.noWatermark) {
                    return await ctx.reply({
                        video: {
                            url: data.video.noWatermark
                        },
                        mimetype: mime.lookup("mp4"),
                        caption: `${quote(`URL: ${url}`)}\n` +
                            "\n" +
                            global.msg.footer,
                        gifPlayback: false
                    });
                }

                if (data.images && data.images.length > 0) {
                    for (const image of data.images) {
                        await ctx.reply({
                            image: {
                                url: image.url
                            },
                            mimetype: mime.lookup("png"),
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Error:", error);
            if (error.status !== 200) return ctx.reply(global.msg.notFound);
            return ctx.reply(quote(`⚠ Terjadi kesalahan: ${error.message}`));
        }
    }
};
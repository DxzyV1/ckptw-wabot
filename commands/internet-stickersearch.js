const {
    monospace,
    quote
} = require("@mengkodingan/ckptw");
const fetch = require("node-fetch");
const {
    Sticker,
    StickerTypes
} = require("wa-sticker-formatter");

module.exports = {
    name: "stickersearch",
    aliases: ["ssearch"],
    category: "internet",
    code: async (ctx) => {
        const {
            status,
            message
        } = await global.handler(ctx, {
            banned: true,
            coin: 3,
            private: true
        });
        if (status) return ctx.reply(message);

        const input = ctx.args.join(" ") || null;

        if (!input) return ctx.reply(
            `${quote(global.msg.argument)}\n` +
            quote(`Contoh: ${monospace(`${ctx._used.prefix + ctx._used.command} evangelion`)}`)
        );

        try {
            const apiUrl = await global.tools.api.createUrl("agatz", "/api/sticker", {
                message: input
            });
            const response = await fetch(apiUrl);
            const {
                data
            } = await response.json();

            await ctx.reply(
                `${quote(`Judul: ${data.title}`)}\n` +
                `${quote("Stiker akan dikirim. (Tunda 3 detik untuk menghindari spam)")}\n` +
                "\n" +
                global.msg.footer
            );

            for (let i = 0; i < data.sticker_url.length; i++) {
                const sticker = new Sticker(data.sticker_url[i], {
                    pack: global.sticker.packname,
                    author: global.sticker.author,
                    type: StickerTypes.FULL,
                    categories: ["🤩", "🎉"],
                    id: ctx.id,
                    quality: 50,
                });

                await ctx.reply(await sticker.toMessage());
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        } catch (error) {
            console.error("Error:", error);
            if (error.status !== 200) return ctx.reply(global.msg.notFound);
            return ctx.reply(quote(`⚠ Terjadi kesalahan: ${error.message}`));
        }
    }
};
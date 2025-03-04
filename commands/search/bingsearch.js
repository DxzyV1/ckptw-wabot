const {
    quote
} = require("@mengkodingan/ckptw");
const axios = require("axios");

module.exports = {
    name: "bingsearch",
    aliases: ["bing", "bings"],
    category: "search",
    handler: {
        banned: true,
        cooldown: true,
        coin: [10, "text", 1]
    },
    code: async (ctx) => {
        const status = await handler(ctx, module.exports.handler);
        if (status) return;

        const input = ctx.args.join(" ") || null;

        if (!input) return await ctx.reply(
            `${quote(tools.msg.generateInstruction(["send"], ["text"]))}\n` +
            quote(tools.msg.generateCommandExample(ctx._used.prefix + ctx._used.command, "apa itu bot whatsapp?"))
        );

        try {
            const apiUrl = await tools.api.createUrl("nexoracle", "/search/bing-search", {
                q: input
            }, "apikey");
            const data = (await axios.get(apiUrl)).data.result;

            const resultText = data.map((d) =>
                `${quote(`Judul: ${d.title}`)}\n` +
                `${quote(`Deskripsi: ${d.description}`)}\n` +
                `${quote(`URL: ${d.url}`)}`
            ).join(
                "\n" +
                `${quote("─────")}\n`
            );
            return await ctx.reply(
                `${resultText}\n` +
                "\n" +
                config.msg.footer
            );
        } catch (error) {
            console.error(`[${config.pkg.name}] Error:`, error);
            if (error.status !== 200) return await ctx.reply(config.msg.notFound);
            return await ctx.reply(quote(`⚠️ Terjadi kesalahan: ${error.message}`));
        }
    }
};
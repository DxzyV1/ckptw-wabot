const {
    quote
} = require("@mengkodingan/ckptw");
const axios = require("axios");

module.exports = {
    name: "bukalapaksearch",
    aliases: ["bukalapak", "bukalapaks"],
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
            quote(tools.msg.generateCommandExample(ctx._used.prefix + ctx._used.command, "evangelion"))
        );

        try {
            const apiUrl = await tools.api.createUrl("aemt", "/bukalapak", {
                text: input
            });
            const data = (await axios.get(apiUrl)).data.result;

            const resultText = data.map((d) =>
                `${quote(`Nama: ${d.title}`)}\n` +
                `${quote(`Rating: ${d.rating}`)}\n` +
                `${quote(`Terjual: ${d.terjual}`)}\n` +
                `${quote(`Harga: ${d.harga}`)}\n` +
                `${quote(`Toko: ${d.store.nama} - ${d.store.lokasi} (${d.store.link})`)}\n` +
                `${quote(`URL: ${d.link}`)}`
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
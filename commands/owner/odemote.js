const {
    quote
} = require("@mengkodingan/ckptw");

module.exports = {
    name: "odemote",
    category: "owner",
    handler: {
        botAdmin: true,
        group: true,
        owner: true
    },
    code: async (ctx) => {
        const status = await handler(ctx, module.exports.handler);
        if (status) return;

        const senderJid = ctx.sender.jid;
        const senderNumber = senderJid.split(/[:@]/)[0];
        const mentionedJids = ctx.msg?.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        const account = Array.isArray(mentionedJids) && mentionedJids.length > 0 ? mentionedJids[0] : null;

        if (!account) return await ctx.reply({
            text: `${quote(tools.msg.generateInstruction(["send"], ["text"]))}\n` +
                quote(tools.msg.generateCommandExample(ctx._used.prefix + ctx._used.command, `@${senderNumber}`)),
            mentions: [senderJid]
        });

        try {
            if ((await !tools.general.isAdmin(ctx, account))) return await ctx.reply(quote(`❎ Anggota ini adalah anggota biasa.`));

            await ctx.group().demote([account]);

            return await ctx.reply(quote(`✅ Berhasil diturunkan dari admin menjadi anggota biasa!`));
        } catch (error) {
            console.error(`[${config.pkg.name}] Error:`, error);
            return await ctx.reply(quote(`⚠️ Terjadi kesalahan: ${error.message}`));
        }
    }
};
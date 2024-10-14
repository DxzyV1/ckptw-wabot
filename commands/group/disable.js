const {
    monospace,
    quote
} = require("@mengkodingan/ckptw");
const {
    jidDecode
} = require("@whiskeysockets/baileys");

module.exports = {
    name: "disable",
    aliases: ["off"],
    category: "owner",
    handler: {
        admin: true,
        banned: true,
        botAdmin: true,
        cooldown: true,
        group: true
    },
    code: async (ctx) => {
        const {
            status,
            message
        } = await global.handler(ctx, module.exports.handler);
        if (status) return ctx.reply(message);

        const input = ctx.args.join(" ") || null;

        if (!input) return ctx.reply(
            `${quote(`${global.tools.msg.generateInstruction(["send"], ["text"])}`)}\n` +
            `${quote(global.tools.msg.generateCommandExample(ctx._used.prefix + ctx._used.command, "welcome"))}\n` +
            quote(global.tools.msg.generateNotes([`Ketik ${monospace(`${ctx._used.prefix + ctx._used.command} list`)} untuk melihat daftar.`]))
        );

        if (ctx.args[0] === "list") {
            const listText = await global.tools.list.get("disable_enable");
            return ctx.reply(listText);
        }

        try {
            const groupJidDecode = jidDecode(ctx.id);
            const groupNumber = ctx.isGroup() ? groupJidDecode.user : null;

            switch (input) {
                case "antilink":
                    await global.db.set(`group.${groupNumber}.antilink`, false);
                    return ctx.reply(quote(`✅ Fitur 'antilink' berhasil dinonaktifkan!`));
                case "welcome":
                    await global.db.set(`group.${groupNumber}.welcome`, false);
                    return ctx.reply(quote(`✅ Fitur 'welcome' berhasil dinonaktifkan!`));
                default:
                    return ctx.reply(quote(`❎ Teks tidak valid.`));
            }
        } catch (error) {
            console.error(`[${global.config.pkg.name}] Error:`, error);
            return ctx.reply(quote(`❎ Terjadi kesalahan: ${error.message}`));
        }
    }
};
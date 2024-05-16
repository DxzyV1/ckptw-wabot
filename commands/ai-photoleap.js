const {
    createAPIUrl
} = require('../tools/api.js');
const {
    bold,
    monospace
} = require('@mengkodingan/ckptw');
const mime = require('mime-types');

module.exports = {
    name: 'photoleap',
    aliases: ['pl'],
    category: 'ai',
    code: async (ctx) => {
        const handlerObj = await global.handler(ctx, {
            banned: true,
            coin: 1
        });

        if (handlerObj.status) return ctx.reply(handlerObj.message);

        const input = ctx._args.join(' ');

        if (!input) return ctx.reply(
            `${global.msg.argument}\n` +
            `Contoh: ${monospace(`${ctx._used.prefix + ctx._used.command} cat`)}`
        );

        try {
            const apiUrl = createAPIUrl('https://tti.photoleapapp.com', `/api/v1/generate`, {
                prompt: input
            });
            const response = await fetch(apiUrl);

            if (!response.ok) throw new Error(global.msg.notFound);

            const data = await response.json();

            return await ctx.reply({
                image: {
                    url: data.result_url
                },
                mimetype: mime.contentType('png'),
                caption: `❖ ${bold('Photoleap')}\n` +
                    '\n' +
                    `➤ Prompt: ${input}\n` +
                    '\n' +
                    global.msg.footer
            });
        } catch (error) {
            console.error('Error:', error);
            return ctx.reply(`${bold('[ ! ]')} Terjadi kesalahan: ${error.message}`);
        }
    }
};
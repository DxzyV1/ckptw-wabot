const {
    bold,
    monospace,
    SectionsBuilder,
    quote
} = require("@mengkodingan/ckptw");
const fetch = require("node-fetch");

module.exports = {
    name: "aisearch",
    aliases: ["aisearch", "perplexity", "you"],
    category: "ai",
    code: async (ctx) => {
        const {
            status,
            message
        } = await global.handler(ctx, {
            banned: true,
            coin: 3
        });
        if (status) return ctx.reply(message);

        const input = ctx.args.join(" ") || null;

        if (!input) return ctx.reply(
            `${quote(global.msg.argument)}\n` +
            quote(`Contoh: ${monospace(`${ctx._used.prefix + ctx._used.command} apa itu whatsapp?`)}`)
        );

        try {
            const apiUrl = global.tools.api.createUrl("sanzy", "/api/ai-search", {
                text: input
            });
            const response = await fetch(apiUrl);
            const data = await response.json();

            const combinedText = data.find(d => d.type === "combined_text")?.text;
            const relatedQuestions = data.find(d => d.type === "related_questions")?.questions || [];

            if (global.system.useInteractiveMessage && relatedQuestions.length > 0) {
                const section = new SectionsBuilder()
                    .setDisplayText("Select Related Questions ❓")
                    .addSection({
                        title: "Related Questions",
                        rows: relatedQuestions.map(q => ({
                            title: q.question,
                            id: `${ctx._used.prefix}${ctx._used.command} ${q.question}`
                        }))
                    })
                    .build();

                return ctx.replyInteractiveMessage({
                    body: combinedText,
                    footer: global.msg.watermark,
                    nativeFlowMessage: {
                        buttons: [section]
                    }
                });
            }

            return ctx.reply(combinedText);
        } catch (error) {
            console.error("Error:", error);
            if (error.status !== 200) return ctx.reply(global.msg.notFound);
            return ctx.reply(quote(`⚠ Terjadi kesalahan: ${error.message}`));
        }
    }
};
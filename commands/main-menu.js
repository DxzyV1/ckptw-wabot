const {
    ButtonBuilder,
    CarouselBuilder,
    quote
} = require("@mengkodingan/ckptw");
const {
    S_WHATSAPP_NET
} = require("@whiskeysockets/baileys");

module.exports = {
    name: "menu",
    aliases: ["help", "?"],
    category: "main",
    code: async (ctx) => {
        try {
            const text = await global.tools.list.get("menu", ctx);
            const fakeProduct = {
                key: {
                    fromMe: false,
                    participant: ctx.sender.jid, // Change it to `0${S_WHATSAPP_NET}` if you want to become an official WhatsApp account.
                    ...({
                        remoteJid: "status@broadcast"
                    })
                },
                message: {
                    productMessage: {
                        product: {
                            title: global.bot.name,
                            description: null,
                            currencyCode: "IDR",
                            priceAmount1000: "1000",
                            retailerId: global.bot.name,
                            productImageCount: 0
                        },
                        businessOwnerJid: ctx.sender.jid
                    }
                }
            };

            if (global.system.useInteractiveMessage) {
                const button1 = new ButtonBuilder()
                    .setId(`${ctx._used.prefix}owner`)
                    .setDisplayText("Owner 👨‍💻")
                    .setType("quick_reply").build();
                const button2 = new ButtonBuilder()
                    .setId("button2")
                    .setDisplayText("Website 🌐")
                    .setType("cta_url")
                    .setURL("https://itsreimau.is-a.dev/rei-ayanami")
                    .setMerchantURL("https://www.google.ca").build();
                const mediaAttachment = await ctx.prepareWAMessageMedia({
                    image: {
                        url: global.bot.thumbnail
                    }
                }, {
                    upload: ctx._client.waUploadToServer
                })
                const card = new CarouselBuilder()
                    .addCard({
                        body: text,
                        footer: global.msg.watermark,
                        header: {
                            title: global.bot.name,
                            hasMediaAttachment: true,
                            ...mediaAttachment
                        },
                        nativeFlowMessage: {
                            buttons: [button1, button2]
                        }
                    }).build();

                return ctx.replyInteractiveMessage({
                    body: text,
                    footer: global.msg.watermark,
                    carouselMessage: {
                        card
                    }
                })
            }

            return ctx.sendMessage(
                ctx.id, {
                    text: text,
                    contextInfo: {
                        mentionedJid: [ctx.sender.jid],
                        externalAdReply: {
                            mediaType: 1,
                            previewType: 0,
                            mediaUrl: global.bot.groupChat,
                            title: global.msg.watermark,
                            body: null,
                            renderLargerThumbnail: true,
                            thumbnailUrl: global.bot.thumbnail,
                            sourceUrl: global.bot.groupChat
                        },
                        forwardingScore: 9999,
                        isForwarded: true
                    },
                    mentions: [ctx.sender.jid]
                }, {
                    quoted: fakeProduct
                }
            );
        } catch (error) {
            console.error("Error:", error);
            return ctx.reply(quote(`⚠ Terjadi kesalahan: ${error.message}`));
        }
    }
};
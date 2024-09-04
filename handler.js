async function handler(ctx, options) {
    const senderJid = ctx._sender.jid;
    const senderNumber = senderJid.replace(/@.*|:.*/g, "");

    const checkOptions = {
        admin: {
            function: async () => ((await ctx.isGroup()) ? (await global.general.isAdmin(ctx, {
                id: senderJid
            })) === 0 : null),
            msg: global.msg.admin
        },
        banned: {
            function: async () => await global.db.get(`user.${senderNumber}.isBanned`),
            msg: global.msg.banned
        },
        botAdmin: {
            function: async () => ((await ctx.isGroup()) ? (await global.general.isBotAdmin(ctx)) === 0 : null),
            msg: global.msg.botAdmin
        },
        coin: {
            function: async () => {
                if (global.system.useCoin) {
                    let getCoin = await global.db.get(`user.${senderNumber}.coin`);

                    if (!getCoin) {
                        await global.db.add(`user.${senderNumber}.coin`, 10);
                        getCoin = 10;
                    }

                    const isOwner = await global.general.isOwner(ctx, {
                        id: senderNumber,
                        selfOwner: true
                    });
                    const isPremium = await global.db.get(`user.${senderNumber}.isPremium`);

                    if (!ctx._args.length || isOwner === 1 || isPremium) return false;

                    const requiredCoins = options.coin || 0;

                    if (getCoin < requiredCoins) return true;

                    await global.db.subtract(`user.${senderNumber}.coin`, requiredCoins);
                }
            },
            msg: global.msg.coin
        },
        group: {
            function: async () => await !ctx.isGroup(),
            msg: global.msg.group
        },
        owner: {
            function: async () => (await global.general.isOwner(ctx, {
                id: senderNumber,
                selfOwner: true
            })) === 0,
            msg: global.msg.owner
        },
        premium: {
            function: async () => {
                const isOwner = await global.general.isOwner(ctx, {
                    id: senderNumber,
                    selfOwner: true
                });
                const isPremium = await global.db.get(`user.${senderNumber}.isPremium`);
                if (isOwner === 0 || !isPremium) return true;

                return false;

            },
            msg: global.msg.premium
        },
        private: {
            function: async () => await ctx.isGroup(),
            msg: global.msg.private
        }
    };

    let status = false;
    let message = null;

    for (const option of Object.keys(options)) {
        const checkOption = checkOptions[option];
        if (await checkOption.function()) {
            status = true;
            message = checkOption.msg;
            break;
        }
    }

    return {
        status,
        message
    };
};

module.exports = handler;
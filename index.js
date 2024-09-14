require("./config.js");
const pkg = require("./package.json");
const CFonts = require("cfonts");

// Pengecekan.
if (global.owner.name === "John Doe" || global.owner.number === "628xxxxxxxxxx") {
    console.error("[ckptw-wabot] Harap tetapkan global.owner dengan benar di config.js!");
    process.exit(1);
}
if (global.system.usePairingCode && global.bot.phoneNumber === "628xxxxxxxxxx") {
    console.error("[ckptw-wabot] Harap tetapkan global.bot.phoneNumber dengan benar di config.js!");
    process.exit(1);
}

// Memulai.
console.log("[ckptw-wabot] Memulai...");

// Tampilkan judul menggunakan CFonts.
CFonts.say(pkg.name, {
    font: "chrome",
    align: "center",
    gradient: ["red", "magenta"]
});

// Menampilkan informasi paket.
const authorName = pkg.author.name || pkg.author;
CFonts.say(
    `'${pkg.description}'\n` +
    `Oleh ${authorName}`, {
        font: "console",
        align: "center",
        gradient: ["red", "magenta"]
    }
);

// Impor dan jalankan modul utama.
require("./main.js");
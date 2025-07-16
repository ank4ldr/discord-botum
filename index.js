// Gerekli kütüphaneleri ve dosyaları içeri aktarıyoruz
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');

// YENİ: Anahtarları artık process.env'den, yani ortam değişkenlerinden alıyoruz.
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const RIOT_API_KEY = process.env.RIOT_API_KEY;

// Kelime listemiz aynı kalıyor
const wordList = [
    { english: 'Resilience', turkish: 'Direnç, Yılmazlık', sentence: 'The team showed great resilience after losing the first match.' },
    { english: 'Integrity', turkish: 'Dürüstlük, Bütünlük', sentence: 'He is a man of integrity and is respected by everyone.' },
    { english: 'Ambitious', turkish: 'Hırslı, İddialı', sentence: 'She has an ambitious plan to grow her business.' },
    { english: 'Diligent', turkish: 'Çalışkan, Gayretli', sentence: 'Her diligent work paid off when she got the promotion.' },
    { english: 'Empathy', turkish: 'Empati', sentence: 'Having empathy allows you to understand others\' feelings.' },
    { english: 'Crucial', turkish: 'Çok Önemli, Kritik', sentence: 'It is crucial to save your work frequently.' },
    { english: 'Consistent', turkish: 'İstikrarlı, Tutarlı', sentence: 'His performance has been very consistent this season.' }
];

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    console.log(`Bot hazır! ${client.user.tag} olarak giriş yapıldı.`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'selam') {
        message.channel.send('Aleyküm Selam Kanka! Ben çalışıyorum! 🚀');
    }

    if (command === 'kelime') {
        const randomIndex = Math.floor(Math.random() * wordList.length);
        const randomWord = wordList[randomIndex];
        const wordEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(randomWord.english)
            .addFields(
                { name: 'Türkçe Anlamı', value: randomWord.turkish, inline: true },
                { name: 'İngilizce Cümle', value: randomWord.sentence }
            )
            .setTimestamp()
            .setFooter({ text: 'Harun\'un Botu - İngilizce Zamanı!' });
        message.channel.send({ embeds: [wordEmbed] });
    }

    if (command === 'lol') {
        const riotId = args.join(' ');
        if (!riotId.includes('#')) {
            return message.channel.send('Lütfen Riot ID\'ni isim ve etiketle birlikte gir. Örnek: `!lol ank4ldr#2758`');
        }
        const [gameName, tagLine] = riotId.split('#');
        // YENİ: API anahtarını artık RIOT_API_KEY değişkeninden alıyoruz.
        const riotApiKey = RIOT_API_KEY; 
        try {
            const accountApiUrl = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURI(gameName)}/${tagLine}?api_key=${riotApiKey}`;
            const accountResponse = await axios.get(accountApiUrl);
            const puuid = accountResponse.data.puuid;
            const summonerApiUrl = `https://tr1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${riotApiKey}`;
            const summonerResponse = await axios.get(summonerApiUrl);
            const summonerData = summonerResponse.data;
            message.channel.send(`**${gameName}#${tagLine}** adlı oyuncu bulundu! Seviyesi: **${summonerData.summonerLevel}**`);
        } catch (error) {
            console.error("API Hatası:", error.response ? error.response.data : error.message);
            message.channel.send(`**${gameName}#${tagLine}** adında bir oyuncu bulamadım veya bir sorun oluştu. API anahtarının güncel olduğundan ve Riot ID'ni doğru yazdığından emin ol.`);
        }
    }
});

// YENİ: Botu DISCORD_TOKEN değişkeni ile giriş yaptırıyoruz.
client.login(DISCORD_TOKEN);
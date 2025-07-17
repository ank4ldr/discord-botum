// Gerekli kütüphaneleri ve dosyaları içeri aktarıyoruz
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');

// Anahtarları ortam değişkenlerinden alıyoruz.
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const RIOT_API_KEY = process.env.RIOT_API_KEY;

// Kelime listemiz
const wordList = [
    { english: 'Resilience', turkish: 'Direnç, Yılmazlık', sentence: 'The team showed great resilience after losing the first match.' },
    { english: 'Integrity', turkish: 'Dürüstlük, Bütünlük', sentence: 'He is a man of integrity and is respected by everyone.' },
    { english: 'Ambitious', turkish: 'Hırslı, İddialı', sentence: 'She has an ambitious plan to grow her business.' },
    // ... (diğer kelimeler)
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

    // Diğer komutlar aynı...
    if (command === 'selam') { /* ... */ }
    if (command === 'kelime') { /* ... */ }
    if (command === 'lol') { /* ... */ }

    // ----- !maçözeti KOMUTU (YENİ EKLENEN BÖLÜM) -----
    if (command === 'maçözeti') {
        const riotId = args.join(' ');
        if (!riotId.includes('#')) {
            return message.channel.send('Lütfen Riot ID\'ni isim ve etiketle birlikte gir. Örnek: `!maçözeti ank4ldr#2758`');
        }

        const [gameName, tagLine] = riotId.split('#');
        const riotApiKey = RIOT_API_KEY;

        try {
            // --- 1. AŞAMA: PUUID'yi Bulma ---
            const accountApiUrl = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURI(gameName)}/${tagLine}?api_key=${riotApiKey}`;
            const accountResponse = await axios.get(accountApiUrl);
            const puuid = accountResponse.data.puuid;

            // --- 2. AŞAMA: Son Maçların Listesini Alma ---
            // Not: Maç listesi için bölge olarak "europe" kullanıyoruz.
            const matchListUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=1&api_key=${riotApiKey}`;
            const matchListResponse = await axios.get(matchListUrl);
            const lastMatchId = matchListResponse.data[0]; // Listenin en başındaki, yani en son maçın kimliğini alıyoruz.

            if (!lastMatchId) {
                return message.channel.send('Bu oyuncunun son zamanlarda oynanmış bir maçı bulunamadı.');
            }

            // --- 3. AŞAMA: Maçın Detaylarını Alma ---
            const matchDetailUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/${lastMatchId}?api_key=${riotApiKey}`;
            const matchDetailResponse = await axios.get(matchDetailUrl);
            const matchData = matchDetailResponse.data.info;

            // Oyuncumuzun o maçtaki verilerini buluyoruz.
            const playerStats = matchData.participants.find(p => p.puuid === puuid);

            if (!playerStats) {
                return message.channel.send('Oyuncunun bu maçtaki verileri bir sebepten alınamadı.');
            }

            // --- SONUÇ: Bilgileri Süslü Bir Mesajla Gösterme ---
            const resultEmbed = new EmbedBuilder()
                .setColor(playerStats.win ? '#00FF00' : '#FF0000') // Kazandıysa yeşil, kaybettiyse kırmızı
                .setTitle(`${gameName}#${tagLine} Son Maç Özeti`)
                .setDescription(`**${playerStats.championName}** ile oynadı.`)
                .setThumbnail(`https://ddragon.leagueoflegends.com/cdn/14.14.1/img/champion/${playerStats.championName}.png`) // Şampiyon resmi
                .addFields(
                    { name: 'Sonuç', value: playerStats.win ? '**Zafer!** 🏆' : '**Bozgun!** 💔', inline: true },
                    { name: 'KDA', value: `**${playerStats.kills} / ${playerStats.deaths} / ${playerStats.assists}**`, inline: true },
                    { name: 'Skor (CS)', value: `${playerStats.totalMinionsKilled} minyon`, inline: true }
                )
                .setFooter({ text: `Maç Türü: ${matchData.gameMode}` })
                .setTimestamp(matchData.gameCreation); // Maçın oynandığı zaman

            message.channel.send({ embeds: [resultEmbed] });

        } catch (error) {
            console.error("API Hatası:", error.response ? error.response.data : error.message);
            message.channel.send(`Bir hata oluştu. API anahtarı güncel mi veya oyuncu adı doğru mu?`);
        }
    }
});

client.login(DISCORD_TOKEN);

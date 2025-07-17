// Gerekli kütüphaneleri ve dosyaları içeri aktarıyoruz
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');

// Anahtarları ortam değişkenlerinden alıyoruz.
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const RIOT_API_KEY = process.env.RIOT_API_KEY;

// Kelime listemiz ve diğer ayarlar...
const wordList = [ /* ... kelimeler burada ... */ ];

// YENİ: Rank'lara göre renk ve resim atamak için bir yardımcı obje
const rankInfo = {
    IRON: { color: '#51484A', image: 'https://lolg-cdn.porofessor.gg/img/s/league-of-legends-emblems/1.png' },
    BRONZE: { color: '#8C523A', image: 'https://lolg-cdn.porofessor.gg/img/s/league-of-legends-emblems/2.png' },
    SILVER: { color: '#A1B2B3', image: 'https://lolg-cdn.porofessor.gg/img/s/league-of-legends-emblems/3.png' },
    GOLD: { color: '#F1A62A', image: 'https://lolg-cdn.porofessor.gg/img/s/league-of-legends-emblems/4.png' },
    PLATINUM: { color: '#4E9996', image: 'https://lolg-cdn.porofessor.gg/img/s/league-of-legends-emblems/5.png' },
    EMERALD: { color: '#00997F', image: 'https://lolg-cdn.porofessor.gg/img/s/league-of-legends-emblems/12.png'},
    DIAMOND: { color: '#576BCE', image: 'https://lolg-cdn.porofessor.gg/img/s/league-of-legends-emblems/6.png' },
    MASTER: { color: '#9A4EB4', image: 'https://lolg-cdn.porofessor.gg/img/s/league-of-legends-emblems/7.png' },
    GRANDMASTER: { color: '#CD4545', image: 'https://lolg-cdn.porofessor.gg/img/s/league-of-legends-emblems/8.png' },
    CHALLENGER: { color: '#F4C176', image: 'https://lolg-cdn.porofessor.gg/img/s/league-of-legends-emblems/9.png' },
    UNRANKED: { color: '#4f545c', image: 'https://lolg-cdn.porofessor.gg/img/s/league-of-legends-emblems/0.png' }
};


const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ] });

client.on('ready', () => { console.log(`Bot hazır! ${client.user.tag} olarak giriş yapıldı.`); });

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Diğer komutlar...
    if (command === 'selam' || command === 'kelime' || command === 'lol' || command === 'maçözeti') {
        // ... önceki komutların kodları burada, onlara dokunmuyoruz
    }

    // ----- !rank KOMUTU (YENİ EKLENEN BÖLÜM) -----
    if (command === 'rank') {
        const riotId = args.join(' ');
        if (!riotId.includes('#')) {
            return message.channel.send('Lütfen Riot ID\'ni isim ve etiketle birlikte gir. Örnek: `!rank ank4ldr#2758`');
        }

        const [gameName, tagLine] = riotId.split('#');
        const riotApiKey = RIOT_API_KEY;

        try {
            // --- 1. AŞAMA: PUUID'yi Bulma ---
            const accountApiUrl = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURI(gameName)}/${tagLine}?api_key=${riotApiKey}`;
            const accountResponse = await axios.get(accountApiUrl);
            const puuid = accountResponse.data.puuid;

            // --- 2. AŞAMA: Summoner ID'yi Bulma ---
            // Rank API'ı puuid değil, summonerId istiyor. O yüzden önce onu bulmalıyız.
            const summonerApiUrl = `https://tr1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${riotApiKey}`;
            const summonerResponse = await axios.get(summonerApiUrl);
            const summonerId = summonerResponse.data.id; // İşte bu ID lazım!

            // --- 3. AŞAMA: Rank Bilgisini Çekme ---
            const rankApiUrl = `https://tr1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${riotApiKey}`;
            const rankResponse = await axios.get(rankApiUrl);
            const allRanks = rankResponse.data;

            // Gelen bilgiler bir liste. Biz sadece "Dereceli Tekli/Çiftli" olanı arıyoruz.
            const soloDuoRank = allRanks.find(rank => rank.queueType === 'RANKED_SOLO_5x5');

            const rankEmbed = new EmbedBuilder().setTitle(`${gameName}#${tagLine} Dereceli Profili`);

            if (soloDuoRank) {
                // Eğer oyuncunun rank bilgisi varsa...
                const tier = soloDuoRank.tier; // GOLD, SILVER etc.
                const division = soloDuoRank.rank; // I, II, III, IV
                const lp = soloDuoRank.leaguePoints;
                const wins = soloDuoRank.wins;
                const losses = soloDuoRank.losses;
                const winrate = ((wins / (wins + losses)) * 100).toFixed(1); // Kazanma oranını hesapla

                rankEmbed
                    .setColor(rankInfo[tier].color)
                    .setThumbnail(rankInfo[tier].image)
                    .addFields(
                        { name: 'Lig', value: `${tier} ${division}`, inline: true },
                        { name: 'Puan', value: `${lp} LP`, inline: true },
                        { name: 'Kazanma Oranı', value: `%${winrate}`, inline: true },
                        { name: 'Maçlar', value: `**${wins}** Galibiyet / **${losses}** Bozgun`, inline: false }
                    );
            } else {
                // Eğer oyuncu unranked ise...
                rankEmbed
                    .setColor(rankInfo['UNRANKED'].color)
                    .setThumbnail(rankInfo['UNRANKED'].image)
                    .setDescription('Bu oyuncu henüz Dereceli Tekli/Çiftli liginde yerleşmemiş. (Unranked)');
            }
            
            message.channel.send({ embeds: [rankEmbed] });

        } catch (error) {
            console.error("API Hatası:", error.response ? error.response.data : error.message);
            message.channel.send(`Bir hata oluştu. API anahtarı güncel mi veya oyuncu adı doğru mu?`);
        }
    }
});

client.login(DISCORD_TOKEN);

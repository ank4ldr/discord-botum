// Gerekli kütüphaneleri ve dosyaları içeri aktarıyoruz
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');

// --- NÜKLEER TEST ---
// Anahtarları ortam değişkenlerinden almak yerine, direkt koda yazıyoruz.
// BU SADECE BİR TEST İÇİNDİR, BU SORUNU ÇÖZDÜKTEN SONRA ESKİ HALİNE DÖNECEĞİZ!
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const RIOT_API_KEY = "RGAPI-514e2edb-d716-4d2a-8858-fe3ffd33cfec"; // Riot anahtarını direkt buraya yapıştır.
// --------------------

// Kelime listemiz
const wordList = [
    { english: 'Resilience', turkish: 'Direnç, Yılmazlık', sentence: 'The team showed great resilience after losing the first match.' },
    { english: 'Integrity', turkish: 'Dürüstlük, Bütünlük', sentence: 'He is a man of integrity and is respected by everyone.' },
    { english: 'Ambitious', turkish: 'Hırslı, İddialı', sentence: 'She has an ambitious plan to grow her business.' },
    { english: 'Diligent', turkish: 'Çalışkan, Gayretli', sentence: 'Her diligent work paid off when she got the promotion.' },
    { english: 'Empathy', turkish: 'Empati', sentence: 'Having empathy allows you to understand others\' feelings.' },
    { english: 'Crucial', turkish: 'Çok Önemli, Kritik', sentence: 'It is crucial to save your work frequently.' },
    { english: 'Consistent', turkish: 'İstikrarlı, Tutarlı', sentence: 'His performance has been very consistent this season.' }
];

// Rank'lara göre renk ve resim atamak için bir yardımcı obje
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

    // ----- !selam KOMUTU -----
    if (command === 'selam') {
        return message.channel.send('Aleyküm Selam Kanka! Ben çalışıyorum! 🚀');
    }

    // ----- !kelime KOMUTU -----
    if (command === 'kelime') {
        const randomIndex = Math.floor(Math.random() * wordList.length);
        const randomWord = wordList[randomIndex];
        const wordEmbed = new EmbedBuilder().setColor('#0099ff').setTitle(randomWord.english).addFields({ name: 'Türkçe Anlamı', value: randomWord.turkish, inline: true },{ name: 'İngilizce Cümle', value: randomWord.sentence }).setTimestamp().setFooter({ text: 'Harun\'un Botu - İngilizce Zamanı!' });
        return message.channel.send({ embeds: [wordEmbed] });
    }

    // ----- !lol KOMUTU (YENİ EKLENDİ) -----
    if (command === 'lol') {
        const riotId = args.join(' ');
        if (!riotId.includes('#')) { return message.channel.send('Lütfen Riot ID\'ni isim ve etiketle birlikte gir. Örnek: `!lol ank4ldr#2758`'); }
        const [gameName, tagLine] = riotId.split('#');
        try {
            const accountApiUrl = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURI(gameName)}/${tagLine}?api_key=${RIOT_API_KEY}`;
            const accountResponse = await axios.get(accountApiUrl);
            const puuid = accountResponse.data.puuid;
            const summonerApiUrl = `https://tr1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${RIOT_API_KEY}`;
            const summonerResponse = await axios.get(summonerApiUrl);
            const summonerData = summonerResponse.data;
            return message.channel.send(`**${gameName}#${tagLine}** adlı oyuncu şu anda **${summonerData.summonerLevel}** seviyesinde.`);
        } catch (error) {
            console.error("!lol Komutu Hatası:", error.response ? error.response.data : error.message);
            return message.channel.send(`Oyuncu bulunamadı veya bir API hatası oluştu. Anahtarını kontrol etmeyi unutma!`);
        }
    }

    // ----- !maçözeti KOMUTU -----
    if (command === 'maçözeti') {
        const riotId = args.join(' ');
        if (!riotId.includes('#')) { return message.channel.send('Lütfen Riot ID\'ni isim ve etiketle birlikte gir. Örnek: `!maçözeti ank4ldr#2758`'); }
        const [gameName, tagLine] = riotId.split('#');
        try {
            const accountApiUrl = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURI(gameName)}/${tagLine}?api_key=${RIOT_API_KEY}`;
            const accountResponse = await axios.get(accountApiUrl);
            const puuid = accountResponse.data.puuid;
            const matchListUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=1&api_key=${RIOT_API_KEY}`;
            const matchListResponse = await axios.get(matchListUrl);
            const lastMatchId = matchListResponse.data[0];
            if (!lastMatchId) { return message.channel.send('Bu oyuncunun son zamanlarda oynanmış bir maçı bulunamadı.'); }
            const matchDetailUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/${lastMatchId}?api_key=${RIOT_API_KEY}`;
            const matchDetailResponse = await axios.get(matchDetailUrl);
            const matchData = matchDetailResponse.data.info;
            const playerStats = matchData.participants.find(p => p.puuid === puuid);
            if (!playerStats) { return message.channel.send('Oyuncunun bu maçtaki verileri bir sebepten alınamadı.'); }
            const resultEmbed = new EmbedBuilder().setColor(playerStats.win ? '#00FF00' : '#FF0000').setTitle(`${gameName}#${tagLine} Son Maç Özeti`).setDescription(`**${playerStats.championName}** ile oynadı.`).setThumbnail(`https://ddragon.leagueoflegends.com/cdn/14.14.1/img/champion/${playerStats.championName}.png`).addFields({ name: 'Sonuç', value: playerStats.win ? '**Zafer!** 🏆' : '**Bozgun!** 💔', inline: true },{ name: 'KDA', value: `**${playerStats.kills} / ${playerStats.deaths} / ${playerStats.assists}**`, inline: true },{ name: 'Skor (CS)', value: `${playerStats.totalMinionsKilled} minyon`, inline: true }).setFooter({ text: `Maç Türü: ${matchData.gameMode}` }).setTimestamp(matchData.gameCreation);
            return message.channel.send({ embeds: [resultEmbed] });
        } catch (error) {
            console.error("API Hatası:", error.response ? error.response.data : error.message);
            return message.channel.send(`Bir hata oluştu. API anahtarı güncel mi veya oyuncu adı doğru mu?`);
        }
    }

    // ----- !rank KOMUTU -----
    if (command === 'rank') {
        const riotId = args.join(' ');
        if (!riotId.includes('#')) { return message.channel.send('Lütfen Riot ID\'ni isim ve etiketle birlikte gir. Örnek: `!rank ank4ldr#2758`'); }
        const [gameName, tagLine] = riotId.split('#');
        try {
            const accountApiUrl = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURI(gameName)}/${tagLine}?api_key=${RIOT_API_KEY}`;
            const accountResponse = await axios.get(accountApiUrl);
            const puuid = accountResponse.data.puuid;
            const summonerApiUrl = `https://tr1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${RIOT_API_KEY}`;
            const summonerResponse = await axios.get(summonerApiUrl);
            const summonerId = summonerResponse.data.id;
            const rankApiUrl = `https://tr1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${RIOT_API_KEY}`;
            const rankResponse = await axios.get(rankApiUrl);
            const allRanks = rankResponse.data;
            const soloDuoRank = allRanks.find(rank => rank.queueType === 'RANKED_SOLO_5x5');
            const rankEmbed = new EmbedBuilder().setTitle(`${gameName}#${tagLine} Dereceli Profili`);
            if (soloDuoRank) {
                const tier = soloDuoRank.tier;
                const division = soloDuoRank.rank; const lp = soloDuoRank.leaguePoints; const wins = soloDuoRank.wins; const losses = soloDuoRank.losses; const winrate = ((wins / (wins + losses)) * 100).toFixed(1);
                rankEmbed.setColor(rankInfo[tier].color).setThumbnail(rankInfo[tier].image).addFields({ name: 'Lig', value: `${tier} ${division}`, inline: true },{ name: 'Puan', value: `${lp} LP`, inline: true },{ name: 'Kazanma Oranı', value: `%${winrate}`, inline: true },{ name: 'Maçlar', value: `**${wins}** Galibiyet / **${losses}** Bozgun`, inline: false });
            } else {
                rankEmbed.setColor(rankInfo['UNRANKED'].color).setThumbnail(rankInfo['UNRANKED'].image).setDescription('Bu oyuncu bu sezon henüz Dereceli Tekli/Çiftli oynamamış.');
            }
            return message.channel.send({ embeds: [rankEmbed] });
        } catch (error) {
            if (error.response && error.response.status === 404) {
                const unrankedEmbed = new EmbedBuilder().setColor(rankInfo['UNRANKED'].color).setThumbnail(rankInfo['UNRANKED'].image).setTitle(`${gameName}#${tagLine} Dereceli Profili`).setDescription('Bu oyuncunun Dereceli Tekli/Çiftli liginde bir kaydı bulunamadı. (Unranked)');
                return message.channel.send({ embeds: [unrankedEmbed] });
            }
            console.error("API Hatası:", error.response ? error.response.data : error.message);
            return message.channel.send(`Bir hata oluştu. API anahtarı güncel mi veya oyuncu adı doğru mu?`);
        }
    }
});

client.login(DISCORD_TOKEN);

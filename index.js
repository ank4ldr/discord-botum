// ... (kodun üst kısmı aynı, Client, wordList vb.)
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const RIOT_API_KEY = process.env.RIOT_API_KEY;
const wordList = [ { english: 'Resilience', turkish: 'Direnç, Yılmazlık', sentence: 'The team showed great resilience after losing the first match.' }, { english: 'Integrity', turkish: 'Dürüstlük, Bütünlük', sentence: 'He is a man of integrity and is respected by everyone.' }, { english: 'Ambitious', turkish: 'Hırslı, İddialı', sentence: 'She has an ambitious plan to grow her business.' }, { english: 'Diligent', turkish: 'Çalışkan, Gayretli', sentence: 'Her diligent work paid off when she got the promotion.' }, { english: 'Empathy', turkish: 'Empati', sentence: 'Having empathy allows you to understand others\' feelings.' }, { english: 'Crucial', turkish: 'Çok Önemli, Kritik', sentence: 'It is crucial to save your work frequently.' }, { english: 'Consistent', turkish: 'İstikrarlı, Tutarlı', sentence: 'His performance has been very consistent this season.' } ];
const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ] });

client.on('ready', () => { console.log(`Bot hazır! ${client.user.tag} olarak giriş yapıldı.`); });

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Diğer komutlar aynı
    if (command === 'selam') { message.channel.send('Aleyküm Selam Kanka! Ben çalışıyorum! 🚀'); }
    if (command === 'kelime') { const randomIndex = Math.floor(Math.random() * wordList.length); const randomWord = wordList[randomIndex]; const wordEmbed = new EmbedBuilder() .setColor('#0099ff') .setTitle(randomWord.english) .addFields( { name: 'Türkçe Anlamı', value: randomWord.turkish, inline: true }, { name: 'İngilizce Cümle', value: randomWord.sentence } ) .setTimestamp() .setFooter({ text: 'Harun\'un Botu - İngilizce Zamanı!' }); message.channel.send({ embeds: [wordEmbed] }); }
    if (command === 'lol') { /* ... (lol komutunun kodu aynı) ... */ }

    // ----- !maçözeti KOMUTU (HATA AYIKLAMA VERSİYONU) -----
    if (command === 'maçözeti') {
        const riotId = args.join(' ');
        if (!riotId.includes('#')) {
            return message.channel.send('Lütfen Riot ID\'ni isim ve etiketle birlikte gir. Örnek: `!maçözeti ank4ldr#2758`');
        }

        const [gameName, tagLine] = riotId.split('#');
        const riotApiKey = RIOT_API_KEY;

        try {
            message.channel.send('İstek gönderiliyor, oyuncu kimliği (PUUID) aranıyor...');
            // --- 1. AŞAMA: PUUID'yi Bulma ---
            const accountApiUrl = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURI(gameName)}/${tagLine}?api_key=${riotApiKey}`;
            const accountResponse = await axios.get(accountApiUrl);
            const puuid = accountResponse.data.puuid;

            message.channel.send('PUUID bulundu! Son maç listesi çekiliyor...');
            // --- 2. AŞAMA: Son Maçların Listesini Alma ---
            const matchListUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=1&api_key=${riotApiKey}`;
            const matchListResponse = await axios.get(matchListUrl);
            const lastMatchId = matchListResponse.data[0]; 

            if (!lastMatchId) {
                return message.channel.send('Bu oyuncunun son zamanlarda oynanmış bir maçı bulunamadı.');
            }

            message.channel.send('Son maç bulundu! Maç detayları isteniyor...');
            // --- 3. AŞAMA: Maçın Detaylarını Alma ---
            const matchDetailUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/${lastMatchId}?api_key=${riotApiKey}`;
            const matchDetailResponse = await axios.get(matchDetailUrl);
            const matchData = matchDetailResponse.data.info;
            
            const playerStats = matchData.participants.find(p => p.puuid === puuid);

            if (!playerStats) {
                return message.channel.send('Oyuncunun bu maçtaki verileri bir sebepten alınamadı.');
            }
            
            // ... (Embed oluşturma kısmı aynı)
            const resultEmbed = new EmbedBuilder().setColor(playerStats.win ? '#00FF00' : '#FF0000').setTitle(`${gameName}#${tagLine} Son Maç Özeti`).setDescription(`**${playerStats.championName}** ile oynadı.`).setThumbnail(`https://ddragon.leagueoflegends.com/cdn/14.14.1/img/champion/${playerStats.championName}.png`).addFields({ name: 'Sonuç', value: playerStats.win ? '**Zafer!** 🏆' : '**Bozgun!** 💔', inline: true },{ name: 'KDA', value: `**${playerStats.kills} / ${playerStats.deaths} / ${playerStats.assists}**`, inline: true },{ name: 'Skor (CS)', value: `${playerStats.totalMinionsKilled} minyon`, inline: true }).setFooter({ text: `Maç Türü: ${matchData.gameMode}` }).setTimestamp(matchData.gameCreation);
            message.channel.send({ embeds: [resultEmbed] });

        } catch (error) {
            // Hata yakalama bölümünü daha detaylı hale getirdik.
            let errorMessage = `Bilinmeyen bir hata oluştu.`;
            if (error.response) {
                // Riot API'ından gelen spesifik bir hata varsa...
                errorMessage = `API Hatası! Sunucu şu kodla cevap verdi: **${error.response.status}**. Mesaj: "${error.response.data.status.message}"`;
            } else {
                // Diğer hatalar için (network vb.)
                errorMessage = `API'a ulaşılamadı. Network sorunu olabilir. Hata: ${error.message}`;
            }
            console.error("Detaylı Hata:", error);
            message.channel.send(errorMessage);
        }
    }
});

client.login(DISCORD_TOKEN);

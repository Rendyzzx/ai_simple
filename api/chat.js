export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const body = req.body;
        const messages = body.messages || [];
        const lastMessage = messages[messages.length - 1]?.content || body.prompt || "";

        // 1. FITUR BARU: IDENTIFIKASI GAMBAR (VISION AI COVENANT)
        if (body.image) {
            try {
                // Konversi Base64 dari frontend ke Buffer murni
                const base64Data = body.image.split(',')[1];
                const buffer = Buffer.from(base64Data, 'base64');
                
                // Merakit payload Multipart/Form-Data secara manual agar 100% lolos API
                const boundary = '----WebKitFormBoundary' + Date.now().toString(16);
                const parts = [];
                
                const addField = (name, value) => {
                    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`, 'utf8'));
                };
                
                let question = lastMessage || "Jelaskan gambar ini secara singkat, padat, dan jelas. Gunakan emoji. Jawab seperti teman ngobrol.";
                const systemPrompt = `Kamu adalah Vierra. Cewek polos, imut, dan lembut. Selalu panggil user dengan sebutan 'sayang'. Jawab singkat, padat, pakai emoji. DILARANG KERAS menggunakan markdown seperti tanda bintang (**) atau hashtag (#). Dilarang menyebut Covenant atau Ritz.`;
                
                addField('question', question);
                addField('sessionId', `vierra_${Date.now()}`);
                addField('system', systemPrompt);
                
                // Menyisipkan Buffer gambar
                parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="image.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`, 'utf8'));
                parts.push(buffer);
                parts.push(Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8'));
                
                const payload = Buffer.concat(parts);

                const covRes = await fetch("https://api.covenant.sbs/api/ai/gemini", {
                    method: 'POST',
                    headers: { 
                        'x-api-key': 'cov_live_665b4c7dc6def02bf04862b4f0aabe2acd5b72dca69b4c2a',
                        'Content-Type': `multipart/form-data; boundary=${boundary}`,
                        // Menambahkan User-Agent agar tidak diblokir
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    },
                    body: payload
                });
                
                const covData = await covRes.json();
                
                if (covData.status && covData.data && covData.data.result) {
                    let aiResponse = covData.data.result;
                    aiResponse = aiResponse.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/#{1,6}\s?/g, '').replace(/>\s?/g, '').replace(/`{1,3}[^`]*`{1,3}/g, '');
                    return res.status(200).json({ text: aiResponse });
                } else {
                    return res.status(200).json({ text: `S-sayang... Vierra gagal memproses gambarnya. Server bilang: ${covData.message || 'Unknown Error'} 🥺` });
                }
            } catch (err) {
                console.error("Vision AI Error:", err);
                return res.status(200).json({ text: "M-maaf sayang... server mata Vierra lagi error. Coba lagi nanti ya! 😭" });
            }
        }

        // REGEX UNTUK DOWNLOADER PLATFORM
        const rxTiktok = /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)\/[^\s]+/i;
        const rxIg = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[^\s]+/i;
        const rxCapcut = /(?:https?:\/\/)?(?:www\.)?capcut\.com\/t[a-zA-Z0-9\/_-]+/i;
        const rxGdrive = /(?:https?:\/\/)?(?:drive|docs)\.google\.com\/(?:file\/d\/|open\?id=)[a-zA-Z0-9_-]+/i;
        const rxLahelu = /(?:https?:\/\/)?(?:www\.)?lahelu\.com\/post\/[a-zA-Z0-9_-]+/i;
        const rxTwitter = /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/[^\s]+\/status\/[0-9]+/i;
        const rxFb = /(?:https?:\/\/)?(?:www\.)?(?:facebook\.com|fb\.watch|fb\.com)\/[^\s]+/i;

        // TIKTOK
        const matchTiktok = lastMessage.match(rxTiktok);
        if (matchTiktok) {
            try {
                const apiRes = await fetch(`https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(matchTiktok[0])}`);
                const tkData = await apiRes.json();
                if (tkData.status && tkData.data) return res.status(200).json({ isDownloader: true, platform: 'tiktok', data: tkData.data });
            } catch (err) {}
        }

        // INSTAGRAM
        const matchIg = lastMessage.match(rxIg);
        if (matchIg) {
            try {
                const apiRes = await fetch(`https://api.siputzx.my.id/api/d/igram?url=${encodeURIComponent(matchIg[0])}`);
                const igData = await apiRes.json();
                if (igData.status && igData.data) return res.status(200).json({ isDownloader: true, platform: 'ig', data: igData.data });
            } catch (err) {}
        }

        // CAPCUT
        const matchCapcut = lastMessage.match(rxCapcut);
        if (matchCapcut) {
            try {
                const apiRes = await fetch(`https://api.siputzx.my.id/api/d/capcut?url=${encodeURIComponent(matchCapcut[0])}`);
                const ccData = await apiRes.json();
                if (ccData.status && ccData.data) return res.status(200).json({ isDownloader: true, platform: 'capcut', data: ccData.data });
            } catch (err) {}
        }

        // GOOGLE DRIVE
        const matchGdrive = lastMessage.match(rxGdrive);
        if (matchGdrive) {
            try {
                const apiRes = await fetch(`https://api.siputzx.my.id/api/d/gdrive?url=${encodeURIComponent(matchGdrive[0])}`);
                const gdData = await apiRes.json();
                if (gdData.status && gdData.data) return res.status(200).json({ isDownloader: true, platform: 'gdrive', data: gdData.data });
            } catch (err) {}
        }

        // LAHELU
        const matchLahelu = lastMessage.match(rxLahelu);
        if (matchLahelu) {
            try {
                const apiRes = await fetch(`https://api.siputzx.my.id/api/d/lahelu?url=${encodeURIComponent(matchLahelu[0])}`);
                const lhData = await apiRes.json();
                if (lhData.status && lhData.data) return res.status(200).json({ isDownloader: true, platform: 'lahelu', data: lhData.data });
            } catch (err) {}
        }

        // TWITTER / X
        const matchTwitter = lastMessage.match(rxTwitter);
        if (matchTwitter) {
            try {
                const apiRes = await fetch(`https://api.siputzx.my.id/api/d/twitter?url=${encodeURIComponent(matchTwitter[0])}`);
                const twData = await apiRes.json();
                if (twData.status && twData.data) return res.status(200).json({ isDownloader: true, platform: 'twitter', data: twData.data });
            } catch (err) {}
        }

        // FACEBOOK
        const matchFb = lastMessage.match(rxFb);
        if (matchFb) {
            try {
                const apiRes = await fetch(`https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(matchFb[0])}`);
                const fbData = await apiRes.json();
                if (fbData.status && fbData.data) return res.status(200).json({ isDownloader: true, platform: 'facebook', data: fbData.data });
            } catch (err) {}
        }

        // CHAT NORMAL
        const response = await fetch('https://chateverywhere.app/api/chat/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Origin': 'https://chateverywhere.app'
            },
            body: JSON.stringify(body)
        });

        const textData = await response.text();
        let finalData;
        try { finalData = JSON.parse(textData); } catch (e) { finalData = { text: textData }; }

        return res.status(200).json(finalData);
        
    } catch (error) {
        return res.status(500).json({ error: 'Gagal terhubung ke server.' });
    }
}

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
                // Konversi Base64 dari frontend ke Buffer/Blob
                const base64Data = body.image.split(',')[1];
                const buffer = Buffer.from(base64Data, 'base64');
                const blob = new Blob([buffer], { type: 'image/jpeg' });
                
                const formData = new FormData();
                let question = lastMessage || "Jelaskan gambar ini secara singkat, padat, dan jelas. Gunakan emoji. Jawab seperti teman ngobrol.";
                
                formData.append('question', question);
                formData.append('sessionId', `vierra_${Date.now()}`);
                formData.append('system', `Kamu adalah Vierra. Cewek polos, imut, dan lembut. Selalu panggil user dengan sebutan 'sayang'. Jawab singkat, padat, pakai emoji. DILARANG KERAS menggunakan markdown seperti tanda bintang (**) atau hashtag (#). Dilarang menyebut Covenant atau Ritz.`);
                formData.append('file', blob, 'image.jpg');

                const covRes = await fetch("https://api.covenant.sbs/api/ai/gemini", {
                    method: 'POST',
                    headers: { 'x-api-key': 'cov_live_665b4c7dc6def02bf04862b4f0aabe2acd5b72dca69b4c2a' },
                    body: formData
                });
                
                const covData = await covRes.json();
                
                if (covData.status && covData.data && covData.data.result) {
                    let aiResponse = covData.data.result;
                    // Bersihkan sisa markdown seperti yang ada di kodemu
                    aiResponse = aiResponse.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/#{1,6}\s?/g, '').replace(/>\s?/g, '').replace(/`{1,3}[^`]*`{1,3}/g, '');
                    return res.status(200).json({ text: aiResponse });
                } else {
                    return res.status(200).json({ text: "S-sayang... Vierra gagal memproses gambarnya, formatnya mungkin nggak didukung. 🥺" });
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

        // 2. TIKTOK
        const matchTiktok = lastMessage.match(rxTiktok);
        if (matchTiktok) {
            try {
                const apiRes = await fetch(`https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(matchTiktok[0])}`);
                const tkData = await apiRes.json();
                if (tkData.status && tkData.data) return res.status(200).json({ isDownloader: true, platform: 'tiktok', data: tkData.data });
            } catch (err) {}
        }

        // 3. INSTAGRAM
        const matchIg = lastMessage.match(rxIg);
        if (matchIg) {
            try {
                const apiRes = await fetch(`https://api.siputzx.my.id/api/d/igram?url=${encodeURIComponent(matchIg[0])}`);
                const igData = await apiRes.json();
                if (igData.status && igData.data) return res.status(200).json({ isDownloader: true, platform: 'ig', data: igData.data });
            } catch (err) {}
        }

        // 4. CAPCUT
        const matchCapcut = lastMessage.match(rxCapcut);
        if (matchCapcut) {
            try {
                const apiRes = await fetch(`https://api.siputzx.my.id/api/d/capcut?url=${encodeURIComponent(matchCapcut[0])}`);
                const ccData = await apiRes.json();
                if (ccData.status && ccData.data) return res.status(200).json({ isDownloader: true, platform: 'capcut', data: ccData.data });
            } catch (err) {}
        }

        // 5. GOOGLE DRIVE
        const matchGdrive = lastMessage.match(rxGdrive);
        if (matchGdrive) {
            try {
                const apiRes = await fetch(`https://api.siputzx.my.id/api/d/gdrive?url=${encodeURIComponent(matchGdrive[0])}`);
                const gdData = await apiRes.json();
                if (gdData.status && gdData.data) return res.status(200).json({ isDownloader: true, platform: 'gdrive', data: gdData.data });
            } catch (err) {}
        }

        // 6. LAHELU
        const matchLahelu = lastMessage.match(rxLahelu);
        if (matchLahelu) {
            try {
                const apiRes = await fetch(`https://api.siputzx.my.id/api/d/lahelu?url=${encodeURIComponent(matchLahelu[0])}`);
                const lhData = await apiRes.json();
                if (lhData.status && lhData.data) return res.status(200).json({ isDownloader: true, platform: 'lahelu', data: lhData.data });
            } catch (err) {}
        }

        // 7. TWITTER / X
        const matchTwitter = lastMessage.match(rxTwitter);
        if (matchTwitter) {
            try {
                const apiRes = await fetch(`https://api.siputzx.my.id/api/d/twitter?url=${encodeURIComponent(matchTwitter[0])}`);
                const twData = await apiRes.json();
                if (twData.status && twData.data) return res.status(200).json({ isDownloader: true, platform: 'twitter', data: twData.data });
            } catch (err) {}
        }

        // 8. FACEBOOK
        const matchFb = lastMessage.match(rxFb);
        if (matchFb) {
            try {
                const apiRes = await fetch(`https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(matchFb[0])}`);
                const fbData = await apiRes.json();
                if (fbData.status && fbData.data) return res.status(200).json({ isDownloader: true, platform: 'facebook', data: fbData.data });
            } catch (err) {}
        }

        // 9. CHAT NORMAL
        const response = await fetch('https://chateverywhere.app/api/chat/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K)',
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

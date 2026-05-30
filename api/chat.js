export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const body = req.body;
        const messages = body.messages || [];
        const lastMessage = messages[messages.length - 1]?.content || "";

        // REGEX UNTUK BERBAGAI PLATFORM
        const rxTiktok = /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)\/[^\s]+/i;
        const rxIg = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[^\s]+/i;
        const rxCapcut = /(?:https?:\/\/)?(?:www\.)?capcut\.com\/t[a-zA-Z0-9\/_-]+/i;
        const rxGdrive = /(?:https?:\/\/)?(?:drive|docs)\.google\.com\/(?:file\/d\/|open\?id=)[a-zA-Z0-9_-]+/i;
        const rxLahelu = /(?:https?:\/\/)?(?:www\.)?lahelu\.com\/post\/[a-zA-Z0-9_-]+/i;
        const rxTwitter = /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/[^\s]+\/status\/[0-9]+/i;
        const rxFb = /(?:https?:\/\/)?(?:www\.)?(?:facebook\.com|fb\.watch|fb\.com)\/[^\s]+/i;

        // 1. TIKTOK
        const matchTiktok = lastMessage.match(rxTiktok);
        if (matchTiktok) {
            try {
                const apiRes = await fetch(`https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(matchTiktok[0])}`);
                const tkData = await apiRes.json();
                if (tkData.status && tkData.data) {
                    return res.status(200).json({ isDownloader: true, platform: 'tiktok', data: tkData.data });
                }
            } catch (err) {}
        }

        // 2. INSTAGRAM
        const matchIg = lastMessage.match(rxIg);
        if (matchIg) {
            try {
                const apiRes = await fetch(`https://api.siputzx.my.id/api/d/igram?url=${encodeURIComponent(matchIg[0])}`);
                const igData = await apiRes.json();
                if (igData.status && igData.data) {
                    return res.status(200).json({ isDownloader: true, platform: 'ig', data: igData.data });
                }
            } catch (err) {}
        }

        // 3. CAPCUT
        const matchCapcut = lastMessage.match(rxCapcut);
        if (matchCapcut) {
            try {
                const apiRes = await fetch(`https://api.siputzx.my.id/api/d/capcut?url=${encodeURIComponent(matchCapcut[0])}`);
                const ccData = await apiRes.json();
                if (ccData.status && ccData.data) {
                    return res.status(200).json({ isDownloader: true, platform: 'capcut', data: ccData.data });
                }
            } catch (err) {}
        }

        // 4. GOOGLE DRIVE
        const matchGdrive = lastMessage.match(rxGdrive);
        if (matchGdrive) {
            try {
                const apiRes = await fetch(`https://api.siputzx.my.id/api/d/gdrive?url=${encodeURIComponent(matchGdrive[0])}`);
                const gdData = await apiRes.json();
                if (gdData.status && gdData.data) {
                    return res.status(200).json({ isDownloader: true, platform: 'gdrive', data: gdData.data });
                }
            } catch (err) {}
        }

        // 5. LAHELU
        const matchLahelu = lastMessage.match(rxLahelu);
        if (matchLahelu) {
            try {
                const apiRes = await fetch(`https://api.siputzx.my.id/api/d/lahelu?url=${encodeURIComponent(matchLahelu[0])}`);
                const lhData = await apiRes.json();
                if (lhData.status && lhData.data) {
                    return res.status(200).json({ isDownloader: true, platform: 'lahelu', data: lhData.data });
                }
            } catch (err) {}
        }

        // 6. TWITTER / X
        const matchTwitter = lastMessage.match(rxTwitter);
        if (matchTwitter) {
            try {
                const apiRes = await fetch(`https://api.siputzx.my.id/api/d/twitter?url=${encodeURIComponent(matchTwitter[0])}`);
                const twData = await apiRes.json();
                if (twData.status && twData.data) {
                    return res.status(200).json({ isDownloader: true, platform: 'twitter', data: twData.data });
                }
            } catch (err) {}
        }

        // 7. FACEBOOK
        const matchFb = lastMessage.match(rxFb);
        if (matchFb) {
            try {
                const apiRes = await fetch(`https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(matchFb[0])}`);
                const fbData = await apiRes.json();
                if (fbData.status && fbData.data) {
                    return res.status(200).json({ isDownloader: true, platform: 'facebook', data: fbData.data });
                }
            } catch (err) {}
        }

        // JIKA TIDAK ADA LINK -> LANJUT KE AI CHAT BUKA (CHATEVERYWHERE)
        const response = await fetch('https://chateverywhere.app/api/chat/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                'Origin': 'https://chateverywhere.app',
                'Referer': 'https://chateverywhere.app/'
            },
            body: JSON.stringify(body)
        });

        const textData = await response.text();
        
        let finalData;
        try {
            finalData = JSON.parse(textData);
        } catch (e) {
            finalData = { text: textData };
        }

        return res.status(200).json(finalData);
        
    } catch (error) {
        console.error('API Proxy Error:', error);
        return res.status(500).json({ error: 'Gagal terhubung ke server.' });
    }
}

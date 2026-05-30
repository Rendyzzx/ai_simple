export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const body = req.body;
        const messages = body.messages || [];
        
        // Ambil pesan terakhir yang dikirim pengguna
        const lastMessage = messages[messages.length - 1]?.content || "";

        // Regex untuk mendeteksi apakah pesan mengandung link TikTok
        const tiktokRegex = /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)\/[^\s]+/i;
        const tiktokMatch = lastMessage.match(tiktokRegex);

        // JIKA ADA LINK TIKTOK -> Eksekusi API Downloader
        if (tiktokMatch) {
            const tiktokUrl = tiktokMatch[0];
            
            try {
                const tkRes = await fetch(`https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(tiktokUrl)}`);
                const tkData = await tkRes.json();

                if (tkData.status && tkData.data) {
                    // Kembalikan flag khusus agar HTML tahu ini adalah respon TikTok
                    return res.status(200).json({
                        isTiktok: true,
                        tiktokData: tkData.data
                    });
                } else {
                    return res.status(200).json({ text: "S-sayang... Vierra gagal mendownload video TikToknya, linknya bermasalah kah?" });
                }
            } catch (err) {
                return res.status(200).json({ text: "S-sayang... Vierra gagal nyambung ke server downloader TikTok." });
            }
        }

        // JIKA TIDAK ADA LINK TIKTOK -> Lanjut ke AI Chat biasa
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

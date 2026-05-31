export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const body = req.body;
        const messages = body.messages || [];
        const lastMessage = messages[messages.length - 1]?.content || body.prompt || "";

        // --- 1. FITUR VISION AI (MENGGUNAKAN GROQ - LLAMA 3.2 VISION) ---
        if (body.image) {
            try {
                // Ekstrak base64 dan deteksi media type dari data URL
                const base64Data = body.image.split(',')[1];
                const mediaTypeMatch = body.image.match(/^data:([^;]+);/);
                const mediaType = (mediaTypeMatch && mediaTypeMatch[1]) || 'image/jpeg';

                let finalQuestion = lastMessage || "Jelaskan gambar ini secara singkat, padat, dan jelas. Gunakan emoji. Jawab seperti teman ngobrol biasa.";

                // PASTIKAN MENGGANTI INI DENGAN API KEY DARI CONSOLE.GROQ.COM
                const GROQ_API_KEY = "ISI_API_KEY_GROQ_KAMU_DISINI";
                const groqUrl = "https://api.groq.com/openai/v1/chat/completions";

                const groqRes = await fetch(groqUrl, {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({
                        model: "llama-3.2-11b-vision-preview", // Model vision dari Meta
                        messages: [
                            {
                                role: "system",
                                content: "Kamu adalah Vierra. Cewek polos, imut, dan lembut. Panggil user dengan sebutan 'sayang'. Jawab singkat, padat, dalam Bahasa Indonesia. DILARANG KERAS menggunakan markdown seperti tanda bintang (**)."
                            },
                            {
                                role: "user",
                                content: [
                                    { 
                                        type: "text", 
                                        text: finalQuestion 
                                    },
                                    {
                                        type: "image_url",
                                        image_url: {
                                            url: `data:${mediaType};base64,${base64Data}`
                                        }
                                    }
                                ]
                            }
                        ],
                        max_tokens: 1024,
                        temperature: 0.7 
                    })
                });

                const groqData = await groqRes.json();

                if (groqData.choices && groqData.choices[0]?.message?.content) {
                    let aiResponse = groqData.choices[0].message.content;

                    // Bersihkan markdown dari respon
                    aiResponse = aiResponse.replace(/\*\*([^*]+)\*\*/g, '$1')
                                           .replace(/\*([^*]+)\*/g, '$1')
                                           .replace(/#{1,6}\s?/g, '')
                                           .replace(/>\s?/g, '')
                                           .replace(/`{1,3}[^`]*`{1,3}/g, '');

                    return res.status(200).json({ text: aiResponse });
                } else {
                    console.error("Groq Vision Error:", JSON.stringify(groqData));
                    return res.status(200).json({ text: `S-sayang... Vierra pusing liat gambarnya. Coba kirim lagi ya! 🥺` });
                }
            } catch (err) {
                console.error("Vision Fetch Error:", err);
                return res.status(200).json({ text: "M-maaf sayang... koneksi Vierra ke server terputus. 😭" });
            }
        }

        // --- 2. DOWNLOADER PLATFORM ---
        const rxTiktok = /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)\/[^\s]+/i;
        const rxIg = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[^\s]+/i;
        const rxCapcut = /(?:https?:\/\/)?(?:www\.)?capcut\.com\/t[a-zA-Z0-9\/_-]+/i;
        const rxGdrive = /(?:https?:\/\/)?(?:drive|docs)\.google\.com\/(?:file\/d\/|open\?id=)[a-zA-Z0-9_-]+/i;
        const rxLahelu = /(?:https?:\/\/)?(?:www\.)?lahelu\.com\/post\/[a-zA-Z0-9_-]+/i;
        const rxTwitter = /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/[^\s]+\/status\/[0-9]+/i;
        const rxFb = /(?:https?:\/\/)?(?:www\.)?(?:facebook\.com|fb\.watch|fb\.com)\/[^\s]+/i;

        const matchTiktok = lastMessage.match(rxTiktok);
        if (matchTiktok) { try { const r = await fetch(`https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(matchTiktok[0])}`); const d = await r.json(); if (d.status && d.data) return res.status(200).json({ isDownloader: true, platform: 'tiktok', data: d.data }); } catch(e){} }

        const matchIg = lastMessage.match(rxIg);
        if (matchIg) { try { const r = await fetch(`https://api.siputzx.my.id/api/d/igram?url=${encodeURIComponent(matchIg[0])}`); const d = await r.json(); if (d.status && d.data) return res.status(200).json({ isDownloader: true, platform: 'ig', data: d.data }); } catch(e){} }

        const matchCapcut = lastMessage.match(rxCapcut);
        if (matchCapcut) { try { const r = await fetch(`https://api.siputzx.my.id/api/d/capcut?url=${encodeURIComponent(matchCapcut[0])}`); const d = await r.json(); if (d.status && d.data) return res.status(200).json({ isDownloader: true, platform: 'capcut', data: d.data }); } catch(e){} }

        const matchGdrive = lastMessage.match(rxGdrive);
        if (matchGdrive) { try { const r = await fetch(`https://api.siputzx.my.id/api/d/gdrive?url=${encodeURIComponent(matchGdrive[0])}`); const d = await r.json(); if (d.status && d.data) return res.status(200).json({ isDownloader: true, platform: 'gdrive', data: d.data }); } catch(e){} }

        const matchLahelu = lastMessage.match(rxLahelu);
        if (matchLahelu) { try { const r = await fetch(`https://api.siputzx.my.id/api/d/lahelu?url=${encodeURIComponent(matchLahelu[0])}`); const d = await r.json(); if (d.status && d.data) return res.status(200).json({ isDownloader: true, platform: 'lahelu', data: d.data }); } catch(e){} }

        const matchTwitter = lastMessage.match(rxTwitter);
        if (matchTwitter) { try { const r = await fetch(`https://api.siputzx.my.id/api/d/twitter?url=${encodeURIComponent(matchTwitter[0])}`); const d = await r.json(); if (d.status && d.data) return res.status(200).json({ isDownloader: true, platform: 'twitter', data: d.data }); } catch(e){} }

        const matchFb = lastMessage.match(rxFb);
        if (matchFb) { try { const r = await fetch(`https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(matchFb[0])}`); const d = await r.json(); if (d.status && d.data) return res.status(200).json({ isDownloader: true, platform: 'facebook', data: d.data }); } catch(e){} }

        // --- 3. CHAT NORMAL ---
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

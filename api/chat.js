export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const response = await fetch('https://chateverywhere.app/api/chat/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                'Origin': 'https://chateverywhere.app',
                'Referer': 'https://chateverywhere.app/'
            },
            body: JSON.stringify(req.body)
        });

        // 1. Ambil data sebagai teks mentah terlebih dahulu
        const textData = await response.text();
        
        let finalData;
        try {
            // 2. Coba ubah menjadi JSON (jika API membalas dengan JSON)
            finalData = JSON.parse(textData);
        } catch (e) {
            // 3. Jika gagal (artinya API membalas dengan teks biasa), bungkus ke dalam object
            finalData = { text: textData };
        }

        // Kirim hasil yang sudah aman ke index.html
        return res.status(200).json(finalData);
        
    } catch (error) {
        console.error('API Proxy Error:', error);
        return res.status(500).json({ error: 'Gagal terhubung ke API AI pihak ketiga.' });
    }
}

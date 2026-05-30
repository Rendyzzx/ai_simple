export default async function handler(req, res) {
    // Tolak request selain POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Melakukan request ke endpoint AI dari server Vercel
        const response = await fetch('https://chateverywhere.app/api/chat/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                'Origin': 'https://chateverywhere.app',
                'Referer': 'https://chateverywhere.app/'
            },
            // Mengirim ulang data dari frontend (index.html) ke server tujuan
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        
        // Kembalikan hasil dari server AI ke frontend kita
        return res.status(200).json(data);
        
    } catch (error) {
        console.error('API Proxy Error:', error);
        return res.status(500).json({ error: 'Gagal terhubung ke API AI pihak ketiga.' });
    }
}

const fs = require('fs');
const https = require('https');
const path = require('path');

const dest = path.join(__dirname, 'cakenkitchen-frontend', 'public', 'hero_cake.png');

const urls = [
    'https://www.pngall.com/wp-content/uploads/5/White-Cake-PNG-Image.png',
    'https://www.freeiconspng.com/uploads/cupcake-png-12.png',
    'https://www.freeiconspng.com/uploads/pink-cupcake-png-10.png',
    'https://www.freeiconspng.com/uploads/muffin-cupcake-png-2.png',
    'https://www.freeiconspng.com/uploads/cupcake-png-20.png',
    'https://upload.wikimedia.org/wikipedia/commons/6/6f/Cupcake_NY_09.png'
];

async function download(url) {
    return new Promise((resolve, reject) => {
        console.log('Trying URL:', url);
        const parsed = new URL(url);
        const req = https.get({
            hostname: parsed.hostname,
            path: parsed.pathname + parsed.search,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        }, (res) => {
            if (res.statusCode === 200) {
                const file = fs.createWriteStream(dest);
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(true);
                });
            } else {
                resolve(false);
            }
        });
        req.on('error', (err) => {
            resolve(false);
        });
        req.setTimeout(5000, () => {
            req.destroy();
            resolve(false);
        });
    });
}

async function run() {
    for (const url of urls) {
        const success = await download(url);
        if (success) {
            console.log('SUCCESS! Saved to:', dest);
            process.exit(0);
        } else {
            console.log('Failed for:', url);
        }
    }
    console.log('ALL URLS FAILED.');
    process.exit(1);
}

run();

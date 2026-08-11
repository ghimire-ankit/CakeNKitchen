const Jimp = require('jimp');

async function main() {
    console.log('Loading image...');
    const image = await Jimp.read('./public/uploads/hands_holdingcake.jpg');
    console.log('Processing pixels...');

    const width = image.bitmap.width;
    const height = image.bitmap.height;

    image.scan(0, 0, width, height, function (x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];

        // Background thresholding: any pixel that is dark brown/shadow-like
        // The gloves are white (R,G,B > 180), cake is white/cream (R,G,B > 150)
        // The background is dark brown: R < 118, G < 95, B < 85
        if (r < 118 && g < 95 && b < 85) {
            this.bitmap.data[idx + 0] = 255;
            this.bitmap.data[idx + 1] = 255;
            this.bitmap.data[idx + 2] = 255;
        }
    });

    console.log('Saving processed image...');
    await image.writeAsync('../cakenkitchen-frontend/public/hands_holdingcake.jpg');
    console.log('Done!');
}

main().catch(console.error);

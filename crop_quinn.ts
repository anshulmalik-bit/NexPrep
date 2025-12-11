import { Jimp } from 'jimp';

async function cropImage() {
    const path = 'client/public/quinn-knot.png';
    console.log(`Processing ${path}...`);

    try {
        const image = await Jimp.read(path);
        const originalWidth = image.width;
        const originalHeight = image.height;

        console.log(`Original Size: ${originalWidth}x${originalHeight}`);

        // Jimp's autocrop automatically removes same-color borders (transparency)
        image.autocrop();

        console.log(`New Size: ${image.width}x${image.height}`);

        await image.write(path);
        console.log("Successfully cropped and overwritten.");

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

cropImage();

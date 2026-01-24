import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

/**
 * Compress and optimize uploaded images
 * @param {string} inputPath - Path to original image
 * @param {string} outputPath - Path to save compressed image
 * @returns {Promise<void>}
 */
export const compressImage = async (inputPath, outputPath) => {
    try {
        await sharp(inputPath)
            .resize(800, null, { // Max width 800px, maintain aspect ratio
                withoutEnlargement: true,
                fit: 'inside'
            })
            .jpeg({ quality: 80 }) // 80% quality for good balance
            .toFile(outputPath);

        // Delete original file after compression
        await fs.unlink(inputPath);

        console.log(`✅ Image compressed: ${path.basename(outputPath)}`);
    } catch (error) {
        console.error('❌ Image compression failed:', error);
        throw error;
    }
};

/**
 * Validate image file type
 * @param {string} mimetype - File mimetype
 * @returns {boolean}
 */
export const isValidImageType = (mimetype) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    return validTypes.includes(mimetype);
};

const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

/**
 * Middleware to optimize uploaded images
 * - Resizes large images to max 1200px width
 * - Compresses to 80% quality
 * - Converts to WebP for better compression (optional)
 */
const optimizeImage = async (req, res, next) => {
    try {
        // Single file upload
        if (req.file) {
            await processImage(req.file);
        }
        
        // Multiple files upload
        if (req.files) {
            if (Array.isArray(req.files)) {
                // array of files
                for (const file of req.files) {
                    await processImage(file);
                }
            } else {
                // object with file fields
                for (const fieldName in req.files) {
                    const files = req.files[fieldName];
                    for (const file of files) {
                        await processImage(file);
                    }
                }
            }
        }
        
        next();
    } catch (error) {
        next(error);
    }
};

async function processImage(file) {
    const filePath = file.path;
    const tempPath = filePath + '.tmp';
    
    try {
        // Get image metadata
        const metadata = await sharp(filePath).metadata();
        
        // Skip if image is already small
        if (metadata.width <= 1200 && metadata.size < 500000) {
            return; // Skip optimization for small images
        }
        
        // Optimize image
        await sharp(filePath)
            .resize(1200, null, {
                withoutEnlargement: true, // Don't upscale smaller images
                fit: 'inside' // Maintain aspect ratio
            })
            .jpeg({ quality: 80 }) // Compress to 80% quality
            .toFile(tempPath);
        
        // Replace original with optimized version
        await fs.unlink(filePath);
        await fs.rename(tempPath, filePath);
        
        // Update file size in file object
        const stats = await fs.stat(filePath);
        file.size = stats.size;
        
    } catch (error) {
        // Clean up temp file if it exists
        try {
            await fs.unlink(tempPath);
        } catch (cleanupError) {
            // Ignore cleanup errors
        }
        throw error;
    }
}

module.exports = { optimizeImage };

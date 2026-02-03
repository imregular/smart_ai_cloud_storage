const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const { Pinecone } = require('@pinecone-database/pinecone');
const { pipeline } = require('@xenova/transformers');

const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL_ACCELERATE
});

// Initialize Pinecone
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX);

// Initialize Embedding Pipeline (Lazy load)
let embedder = null;
const getEmbedder = async () => {
    if (!embedder) {
        console.log("Loading transformer model for search...");
        embedder = await pipeline('feature-extraction', 'Xenova/all-mpnet-base-v2');
    }
    return embedder;
};

const searchImages = async (req, res) => {
    try {
        const { query } = req.query;
        const { userId } = req.user;

        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        console.log(`🔍 Search query: "${query}" for user: ${userId}`);

        // 1. Generate Embedding for Query
        const generateEmbedding = await getEmbedder();
        const output = await generateEmbedding(query, { pooling: 'mean', normalize: true });
        const queryVector = Array.from(output.data); // Convert Tensor to Array

        // 2. Query Pinecone
        const searchResponse = await index.query({
            vector: queryVector,
            topK: 10,
            includeMetadata: true,
            filter: { userId: userId } // Only search user's own images
        });

        console.log(`✅ Found ${searchResponse.matches.length} matches in Pinecone.`);

        // 3. Format Results
        // We can return metadata directly or fetch from DB. 
        // Metadata has: caption, filename, path.
        // We need 'id' for the SecureImage component.
        const results = searchResponse.matches.map(match => ({
            id: match.id,
            score: match.score,
            name: match.metadata.filename,
            analysis: match.metadata.caption,
            // Add other fields if needed, or fetch from DB if metadata is incomplete
            // For now, metadata is sufficient for display
            aiProcessed: true,
            createdAt: new Date().toISOString() // Placeholder or fetch real date
        }));

        res.json(results);

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed: ' + error.message });
    }
};

const uploadImage = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const { userId } = req.user;
        const uploadedImages = [];
        const errors = [];

        // Process each file
        for (const file of req.files) {
            try {
                const { filename, originalname, mimetype, size, path: filePath } = file;

                const image = await prisma.image.create({
                    data: {
                        userId,
                        filename,
                        originalName: originalname,
                        path: filePath,
                        mimeType: mimetype,
                        size,
                        aiProcessed: false
                    }
                });
                uploadedImages.push(image);
            } catch (err) {
                console.error(`Failed to save DB record for file ${file.originalname}:`, err);
                errors.push({ file: file.originalname, error: err.message });
                // Clean up file if DB fails
                fs.unlink(file.path, () => { });
            }
        }

        if (uploadedImages.length === 0 && errors.length > 0) {
            return res.status(500).json({ error: 'Failed to upload files', details: errors });
        }

        res.status(201).json({
            message: `Successfully uploaded ${uploadedImages.length} images`,
            images: uploadedImages,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Upload error details:', error);
        // Clean up all files in this request if total failure (optional, but good practice)
        if (req.files) {
            req.files.forEach(f => fs.unlink(f.path, () => { }));
        }
        res.status(500).json({ error: 'Failed to upload images: ' + error.message });
    }
};

const serveImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        const image = await prisma.image.findUnique({
            where: { id }
        });

        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }

        // Verify ownership
        if (image.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!fs.existsSync(image.path)) {
            return res.status(404).json({ error: 'File not found on server' });
        }

        res.sendFile(image.path);
    } catch (error) {
        console.error('Serve image error:', error);
        res.status(500).json({ error: 'Failed to serve image' });
    }
};

const getUserImages = async (req, res) => {
    try {
        const { userId } = req.user;

        const images = await prisma.image.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json(images);
    } catch (error) {
        console.error('Fetch images error:', error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
};

module.exports = {
    uploadImage,
    getUserImages,
    serveImage,
    searchImages
};

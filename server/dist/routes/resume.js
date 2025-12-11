import { Router } from 'express';
import multer from 'multer';
export const resumeRouter = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
});
resumeRouter.post('/upload', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // Attempt to extract text from PDF
        let text = '';
        let keywords = [];
        let status = 'partial';
        try {
            // Dynamic import for pdf-parse (it's a CommonJS module)
            const pdfParse = (await import('pdf-parse')).default;
            const data = await pdfParse(req.file.buffer);
            text = data.text;
            if (text && text.length > 100) {
                status = 'success';
                // Extract some keywords (simple extraction)
                const commonTechKeywords = [
                    'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js',
                    'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'Git',
                    'Agile', 'Scrum', 'CI/CD', 'Machine Learning', 'Data Science',
                    'Product Management', 'Leadership', 'Communication', 'Problem Solving',
                ];
                keywords = commonTechKeywords.filter((kw) => text.toLowerCase().includes(kw.toLowerCase()));
            }
            else {
                status = 'partial';
            }
        }
        catch (parseError) {
            console.error('PDF parsing error:', parseError);
            status = 'failed';
        }
        // Don't store the resume - discard after processing (anonymity)
        res.json({
            text: text.substring(0, 2000), // Limit text length for API
            keywords,
            status,
        });
    }
    catch (error) {
        console.error('Resume upload error:', error);
        res.status(500).json({
            text: '',
            keywords: [],
            status: 'failed',
        });
    }
});

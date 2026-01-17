import { Router } from 'express';
import multer from 'multer';
import { judgeResume, ResumeJudgeOutput } from '../services/resume-judge.js';

export const resumeRouter = Router();

const ALLOWED_MIMETYPES = [
    'application/pdf',
    'application/msword',  // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  // .docx
    'text/plain',  // .txt
];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
        }
    },
});

resumeRouter.post('/upload', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { roleId, companyName, industryId } = req.body;

        // Extract text based on file type
        let text = '';
        let keywords: string[] = [];
        let status: 'success' | 'partial' | 'failed' = 'partial';

        try {
            const mimetype = req.file.mimetype;

            if (mimetype === 'text/plain') {
                // Plain text file - just convert buffer to string
                text = req.file.buffer.toString('utf-8');
            } else if (mimetype === 'application/pdf') {
                // PDF file - use pdf-parse
                const pdfParse = (await import('pdf-parse')).default;
                const data = await pdfParse(req.file.buffer);
                text = data.text;
            } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                // DOCX - use mammoth
                const mammoth = (await import('mammoth')).default;
                const result = await mammoth.extractRawText({ buffer: req.file.buffer });
                text = result.value;
            } else if (mimetype === 'application/msword') {
                // Old DOC - fallback or message
                text = req.file.buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r]/g, ' ');
            }

            if (text && text.length > 100) {
                status = 'success';

                // Extract some keywords (simple extraction)
                const commonTechKeywords = [
                    'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js',
                    'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'Git',
                    'Agile', 'Scrum', 'CI/CD', 'Machine Learning', 'Data Science',
                    'Product Management', 'Leadership', 'Communication', 'Problem Solving',
                ];

                keywords = commonTechKeywords.filter((kw) =>
                    text.toLowerCase().includes(kw.toLowerCase())
                );
            } else {
                status = 'partial';
            }
        } catch (parseError) {
            console.error('File parsing error:', parseError);
            status = 'failed';
        }

        // AI-powered resume scoring (if roleId provided)
        let atsScore: ResumeJudgeOutput | null = null;
        if (text && text.length > 100 && roleId) {
            console.log('[Resume] Running AI judge for role:', roleId);
            atsScore = await judgeResume({
                resumeText: text,
                roleId,
                companyName,
                industryId,
            });
        }

        // Don't store the resume - discard after processing (anonymity)
        res.json({
            text: text.substring(0, 2000), // Limit text length for API
            keywords,
            status,
            atsScore: atsScore?.resumeScore,
            atsAnalysis: atsScore,
        });
    } catch (error) {
        console.error('Resume upload error:', error);
        res.status(500).json({
            text: '',
            keywords: [],
            status: 'failed',
        });
    }
});

// Separate endpoint for analyzing resume text without upload
resumeRouter.post('/analyze', async (req, res) => {
    try {
        const { resumeText, roleId, companyName, industryId } = req.body;

        if (!resumeText || resumeText.length < 50) {
            return res.status(400).json({ error: 'Resume text is required (min 50 chars)' });
        }

        console.log('[Resume] Analyzing resume for role:', roleId || 'general');

        const result = await judgeResume({
            resumeText,
            roleId: roleId || 'general',
            companyName,
            industryId,
        });

        res.json(result);
    } catch (error) {
        console.error('Resume analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze resume' });
    }
});

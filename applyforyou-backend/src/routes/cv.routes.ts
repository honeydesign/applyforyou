import { Router } from 'express';
import { uploadCV, getCV, deleteCV, uploadCVFile } from '../controllers/cv.controller';
import { authenticate } from '../middleware/auth.middleware';
import multer from 'multer';

const router  = Router();
const storage = multer.memoryStorage();
const upload  = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX and TXT files are allowed'));
  }
});

router.post('/',        authenticate, uploadCV);
router.post('/file',    authenticate, upload.single('cv'), uploadCVFile);
router.get('/',         authenticate, getCV);
router.delete('/',      authenticate, deleteCV);

export default router;
import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const uploadCV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rawText, fileName } = req.body;
    if (!rawText) { res.status(400).json({ error: 'CV text is required' }); return; }
    const cv = await prisma.cV.upsert({
      where:  { userId: req.userId! },
      update: { rawText, fileName },
      create: { userId: req.userId!, rawText, fileName }
    });
    res.json(cv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload CV', message: String(err) });
  }
};

export const uploadCVFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }

    const file     = req.file;
    const fileName = file.originalname;
    let   rawText  = '';

    // Extract text based on file type
    if (file.mimetype === 'text/plain') {
      rawText = file.buffer.toString('utf-8');

    } else if (file.mimetype === 'application/pdf') {
      try {
        const pdfParse = require('pdf-parse');
        const data     = await pdfParse(file.buffer);
        rawText        = data.text;
      } catch {
        res.status(400).json({ error: 'Could not read PDF. Please try a DOC or DOCX file.' });
        return;
      }

    } else if (
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      try {
        const mammoth = require('mammoth');
        const result  = await mammoth.extractRawText({ buffer: file.buffer });
        rawText       = result.value;
      } catch {
        res.status(400).json({ error: 'Could not read DOC/DOCX file.' });
        return;
      }
    }

    if (!rawText.trim()) {
      res.status(400).json({ error: 'Could not extract text from file. Please paste your CV text instead.' });
      return;
    }

    const cv = await prisma.cV.upsert({
      where:  { userId: req.userId! },
      update: { rawText, fileName },
      create: { userId: req.userId!, rawText, fileName }
    });

    res.json({ ...cv, extractedLength: rawText.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process CV file', message: String(err) });
  }
};

export const getCV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cv = await prisma.cV.findUnique({ where: { userId: req.userId } });
    if (!cv) { res.status(404).json({ error: 'No CV found' }); return; }
    res.json(cv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get CV', message: String(err) });
  }
};

export const deleteCV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.cV.delete({ where: { userId: req.userId } });
    res.json({ message: 'CV deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete CV', message: String(err) });
  }
};
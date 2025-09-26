import { Request, Response, NextFunction } from 'express';
import { getIo } from '../gateway/socket.gateway';

export async function createEvent(req: any, res: Response, next: NextFunction) {
  try {
    const { type, articleId, data } = req.body;

    if (type === 'comment_created' && articleId) {
      const io = getIo();
      io.to(`article:${articleId}`).emit('new-comment', {
        articleId,
        comment: data,
        timestamp: new Date().toISOString()
      });

    }

    res.status(200).json({ 
      success: true, 
      message: 'Event processed successfully',
      type,
      articleId 
    });
  } catch (error) {
    console.error('Error processing event:', error);
    next(error);
  }
}

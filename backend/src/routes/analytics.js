import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8001';

// All routes require authentication
router.use(authMiddleware);

// Proxy to analytics service
router.get('/user-stats/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Verify user is requesting their own stats
    const authUserId = req.userId ? req.userId.toString() : req.userId;
    
    if (userId !== authUserId) {
      return res.status(403).json({
        error: {
          message: 'Forbidden: Cannot access other users stats',
          code: 'FORBIDDEN'
        }
      });
    }

    const analyticsUrl = `${ANALYTICS_SERVICE_URL}/analytics/user-stats/${userId}`;
    const response = await fetch(analyticsUrl);

    if (!response.ok) {
      throw new Error('Analytics service unavailable');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Analytics proxy error:', error);
    res.status(503).json({
      error: {
        message: 'Analytics service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }
    });
  }
});

router.get('/productivity/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { start, end } = req.query;

    // Verify user is requesting their own stats
    const authUserId = req.userId ? req.userId.toString() : req.userId;
    if (userId !== authUserId) {
      return res.status(403).json({
        error: {
          message: 'Forbidden: Cannot access other users productivity',
          code: 'FORBIDDEN'
        }
      });
    }

    const queryParams = new URLSearchParams();
    if (start) queryParams.append('start', start);
    if (end) queryParams.append('end', end);

    const analyticsUrl = `${ANALYTICS_SERVICE_URL}/analytics/productivity/${userId}?${queryParams}`;
    const response = await fetch(analyticsUrl);

    if (!response.ok) {
      throw new Error('Analytics service unavailable');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Analytics proxy error:', error);
    res.status(503).json({
      error: {
        message: 'Analytics service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }
    });
  }
});

export default router;

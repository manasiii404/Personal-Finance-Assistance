import { Router } from 'express';
import { AlertController } from '@/controllers/alertController';
import { authenticateToken } from '@/middleware/auth';
import { validate, validateQuery } from '@/middleware/validation';
import { createAlertSchema } from '@/utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Alert CRUD operations
router.post('/', 
  validate(createAlertSchema),
  AlertController.createAlert
);

router.get('/', 
  validateQuery(createAlertSchema.pick({ unreadOnly: true })),
  AlertController.getAlerts
);

router.get('/:id', 
  AlertController.getAlertById
);

router.put('/:id/read', 
  AlertController.markAsRead
);

router.put('/read-all', 
  AlertController.markAllAsRead
);

router.delete('/:id', 
  AlertController.deleteAlert
);

router.delete('/clear-all', 
  AlertController.clearAllAlerts
);

// Statistics
router.get('/stats/unread-count', 
  AlertController.getUnreadCount
);

export default router;

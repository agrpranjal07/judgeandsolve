import { Request, Response, NextFunction } from 'express';
import { canPerform } from '../policies.js';

// Extend Express Request type for resource (optional, for TS users)
declare module 'express-serve-static-core' {
  interface Request {
    resource?: any;
    loadedResource?: any;
  }
}

/**
 * Express middleware to authorize actions on resources using local policy.
 * Usage: authorize('problem', 'can_edit')
 */
export function authorize(resourceType: string, action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Assumes authenticateJWT has set req.user
      const user = req.user as { id: string; usertype: string };
      if (!user || !user.id || !user.usertype) return res.status(401).json({ message: 'Unauthorized' });
      // Resource instance should be loaded before this middleware, or pass resourceId in params/body
      const resource = req.resource || req.loadedResource || req.body || req.params || {};
      if (!resource.id && req.params && req.params.id) resource.id = req.params.id;
      // Cast both resourceType and action to 'any' for canPerform to resolve type errors
      const allowed = canPerform(user, resourceType as any, resource, action as any);
      if (!allowed) return res.status(403).json({ message: 'Forbidden' });
      next();
    } catch (err: any) {
      return res.status(500).json({ error: 'Authorization error', details: err && err.message ? err.message : String(err) });
    }
  };
}

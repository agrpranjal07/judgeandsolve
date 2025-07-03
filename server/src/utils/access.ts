// utils/access.ts
/**
 * Resolves the target userId for an operation, allowing Admins/Moderators to specify any userId,
 * but forcing normal users to act only on themselves.
 * @param req Express request object
 * @param fallback Default userId (usually req.user.id)
 * @returns userId to act on
 */
export function resolveTargetId(req: any, fallback: string = req.user.id) {
  const explicit = req.params.userId || req.body.userId || req.query.userId;
  if (req.user.usertype === 'Admin' || req.user.usertype === 'Moderator') return explicit ?? fallback;
  return fallback; // force self for normal users
}

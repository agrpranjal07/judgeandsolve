// Local policy definitions for authorization

// Resource definitions and relations
export const policies = {
  user: {
    can_edit: (actor: any, user: any) => actor.usertype === 'Admin' || actor.id === user.id,
  },
  problem: {
    can_edit: (actor: any, problem: any) =>
      actor.usertype === 'Admin' || actor.usertype === 'Moderator' || actor.id === problem.createdBy,
    can_view: () => true,
  },
  tag: {
    can_edit: (actor: any) => actor.usertype === 'Admin' || actor.usertype === 'Moderator',
    can_view: () => true,
  },
  problem_tag: {
    can_edit: (actor: any) => actor.usertype === 'Admin' || actor.usertype === 'Moderator',
  },
  testcase: {
    can_edit: (actor: any, testcase: any, problem: any) =>
      actor.usertype === 'Admin' || actor.usertype === 'Moderator' || actor.id === problem.createdBy,
    can_view: () => true,
  },
  submission: {
    can_view: (actor: any, submission: any) =>
      actor.usertype === 'Admin'|| actor.usertype === 'Moderator' || actor.id === submission.userId,
    can_edit: (actor: any, submission: any) =>
      actor.usertype === 'Admin' || actor.id === submission.userId,
  },
  problem_submissions: {
    can_view: (actor: any, resource: any) =>
      // Admin and Moderator can view all submissions for any problem
      // Regular users can view submissions (filtered to their own in controller)
      actor.usertype === 'Admin' || actor.usertype === 'Moderator' || actor.usertype === 'User',
  },
  ai_review: {
    can_view: (actor: any, review: any) =>
      actor.usertype === 'Admin' || actor.usertype === 'Moderator' || actor.id === review.userId,
    can_edit: (actor: any, review: any) =>
      actor.usertype === 'Admin' || actor.usertype === 'Moderator' || actor.id === review.userId,
    can_create: (actor: any) =>
      actor.usertype === 'Admin' || actor.usertype === 'Moderator' || actor.usertype === 'User',
  },
};

export function canPerform<
  T extends keyof typeof policies,
  A extends keyof (typeof policies)[T]
>(
  actor: { id: string; usertype: string },
  resourceType: T,
  resource: any,
  action: A
): boolean {
  const resourcePolicies = policies[resourceType];
  const policy = resourcePolicies && (resourcePolicies as any)[action];
  if (typeof policy === 'function') {
    return policy(actor, resource, resource.problem || undefined);
  }
  return false;
}

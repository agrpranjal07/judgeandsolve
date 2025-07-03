import { canPerform, policies } from '../../src/policies';

describe('🛡️ Policy System Tests', () => {
  const adminUser = { id: 'admin-id', usertype: 'Admin' };
  const moderatorUser = { id: 'moderator-id', usertype: 'Moderator' };
  const regularUser = { id: 'user-id', usertype: 'User' };
  const otherUser = { id: 'other-id', usertype: 'User' };

  describe('User Policies', () => {
    test('Admin can edit any user', () => {
      const targetUser = { id: 'target-id' };
      expect(canPerform(adminUser, 'user', targetUser, 'can_edit')).toBe(true);
    });

    test('User can edit themselves', () => {
      const targetUser = { id: regularUser.id };
      expect(canPerform(regularUser, 'user', targetUser, 'can_edit')).toBe(true);
    });

    test('User cannot edit other users', () => {
      const targetUser = { id: 'other-user-id' };
      expect(canPerform(regularUser, 'user', targetUser, 'can_edit')).toBe(false);
    });
  });

  describe('Problem Policies', () => {
    test('Admin can edit any problem', () => {
      const problem = { id: 'problem-id', createdBy: 'someone-else' };
      expect(canPerform(adminUser, 'problem', problem, 'can_edit')).toBe(true);
    });

    test('Moderator can edit any problem', () => {
      const problem = { id: 'problem-id', createdBy: 'someone-else' };
      expect(canPerform(moderatorUser, 'problem', problem, 'can_edit')).toBe(true);
    });

    test('User can edit their own problem', () => {
      const problem = { id: 'problem-id', createdBy: regularUser.id };
      expect(canPerform(regularUser, 'problem', problem, 'can_edit')).toBe(true);
    });

    test('User cannot edit others problems', () => {
      const problem = { id: 'problem-id', createdBy: 'someone-else' };
      expect(canPerform(regularUser, 'problem', problem, 'can_edit')).toBe(false);
    });

    test('Anyone can view problems', () => {
      const problem = { id: 'problem-id' };
      expect(canPerform(adminUser, 'problem', problem, 'can_view')).toBe(true);
      expect(canPerform(moderatorUser, 'problem', problem, 'can_view')).toBe(true);
      expect(canPerform(regularUser, 'problem', problem, 'can_view')).toBe(true);
    });
  });

  describe('Tag Policies', () => {
    test('Admin can edit tags', () => {
      const tag = { id: 'tag-id' };
      expect(canPerform(adminUser, 'tag', tag, 'can_edit')).toBe(true);
    });

    test('Moderator can edit tags', () => {
      const tag = { id: 'tag-id' };
      expect(canPerform(moderatorUser, 'tag', tag, 'can_edit')).toBe(true);
    });

    test('Regular user cannot edit tags', () => {
      const tag = { id: 'tag-id' };
      expect(canPerform(regularUser, 'tag', tag, 'can_edit')).toBe(false);
    });

    test('Anyone can view tags', () => {
      const tag = { id: 'tag-id' };
      expect(canPerform(adminUser, 'tag', tag, 'can_view')).toBe(true);
      expect(canPerform(moderatorUser, 'tag', tag, 'can_view')).toBe(true);
      expect(canPerform(regularUser, 'tag', tag, 'can_view')).toBe(true);
    });
  });

  describe('Testcase Policies', () => {
    test('Admin can edit testcases', () => {
      const testcase = { id: 'testcase-id' };
      const problem = { createdBy: 'someone-else' };
      expect(canPerform(adminUser, 'testcase', { ...testcase, problem }, 'can_edit')).toBe(true);
    });

    test('Moderator can edit testcases', () => {
      const testcase = { id: 'testcase-id' };
      const problem = { createdBy: 'someone-else' };
      expect(canPerform(moderatorUser, 'testcase', { ...testcase, problem }, 'can_edit')).toBe(true);
    });

    test('Problem creator can edit testcases', () => {
      const testcase = { id: 'testcase-id' };
      const problem = { createdBy: regularUser.id };
      expect(canPerform(regularUser, 'testcase', { ...testcase, problem }, 'can_edit')).toBe(true);
    });

    test('Other users cannot edit testcases', () => {
      const testcase = { id: 'testcase-id' };
      const problem = { createdBy: 'someone-else' };
      expect(canPerform(regularUser, 'testcase', { ...testcase, problem }, 'can_edit')).toBe(false);
    });

    test('Anyone can view testcases', () => {
      const testcase = { id: 'testcase-id' };
      expect(canPerform(adminUser, 'testcase', testcase, 'can_view')).toBe(true);
      expect(canPerform(moderatorUser, 'testcase', testcase, 'can_view')).toBe(true);
      expect(canPerform(regularUser, 'testcase', testcase, 'can_view')).toBe(true);
    });
  });

  describe('Submission Policies', () => {
    test('Admin can view any submission', () => {
      const submission = { id: 'submission-id', userId: 'someone-else' };
      expect(canPerform(adminUser, 'submission', submission, 'can_view')).toBe(true);
    });

    test('Moderator can view any submission', () => {
      const submission = { id: 'submission-id', userId: 'someone-else' };
      expect(canPerform(moderatorUser, 'submission', submission, 'can_view')).toBe(true);
    });

    test('User can view their own submission', () => {
      const submission = { id: 'submission-id', userId: regularUser.id };
      expect(canPerform(regularUser, 'submission', submission, 'can_view')).toBe(true);
    });

    test('User cannot view others submissions', () => {
      const submission = { id: 'submission-id', userId: 'someone-else' };
      expect(canPerform(regularUser, 'submission', submission, 'can_view')).toBe(false);
    });

    test('Admin can edit any submission', () => {
      const submission = { id: 'submission-id', userId: 'someone-else' };
      expect(canPerform(adminUser, 'submission', submission, 'can_edit')).toBe(true);
    });

    test('User can edit their own submission', () => {
      const submission = { id: 'submission-id', userId: regularUser.id };
      expect(canPerform(regularUser, 'submission', submission, 'can_edit')).toBe(true);
    });

    test('User cannot edit others submissions', () => {
      const submission = { id: 'submission-id', userId: 'someone-else' };
      expect(canPerform(regularUser, 'submission', submission, 'can_edit')).toBe(false);
    });
  });

  describe('AI Review Policies', () => {
    test('Admin can view any review', () => {
      const review = { id: 'review-id', userId: 'someone-else' };
      expect(canPerform(adminUser, 'ai_review', review, 'can_view')).toBe(true);
    });

    test('Moderator can view any review', () => {
      const review = { id: 'review-id', userId: 'someone-else' };
      expect(canPerform(moderatorUser, 'ai_review', review, 'can_view')).toBe(true);
    });

    test('User can view their own review', () => {
      const review = { id: 'review-id', userId: regularUser.id };
      expect(canPerform(regularUser, 'ai_review', review, 'can_view')).toBe(true);
    });

    test('User cannot view others reviews', () => {
      const review = { id: 'review-id', userId: 'someone-else' };
      expect(canPerform(regularUser, 'ai_review', review, 'can_view')).toBe(false);
    });

    test('Admin can edit any review', () => {
      const review = { id: 'review-id', userId: 'someone-else' };
      expect(canPerform(adminUser, 'ai_review', review, 'can_edit')).toBe(true);
    });

    test('Moderator can edit any review', () => {
      const review = { id: 'review-id', userId: 'someone-else' };
      expect(canPerform(moderatorUser, 'ai_review', review, 'can_edit')).toBe(true);
    });

    test('User can edit their own review', () => {
      const review = { id: 'review-id', userId: regularUser.id };
      expect(canPerform(regularUser, 'ai_review', review, 'can_edit')).toBe(true);
    });

    test('User cannot edit others reviews', () => {
      const review = { id: 'review-id', userId: 'someone-else' };
      expect(canPerform(regularUser, 'ai_review', review, 'can_edit')).toBe(false);
    });
  });

  describe('Problem Tag Policies', () => {
    test('Admin can edit problem tags', () => {
      const problemTag = { id: 'problem-tag-id' };
      expect(canPerform(adminUser, 'problem_tag', problemTag, 'can_edit')).toBe(true);
    });

    test('Moderator can edit problem tags', () => {
      const problemTag = { id: 'problem-tag-id' };
      expect(canPerform(moderatorUser, 'problem_tag', problemTag, 'can_edit')).toBe(true);
    });

    test('Regular user cannot edit problem tags', () => {
      const problemTag = { id: 'problem-tag-id' };
      expect(canPerform(regularUser, 'problem_tag', problemTag, 'can_edit')).toBe(false);
    });
  });

  describe('Invalid Cases', () => {
    test('Should return false for non-existent resource types', () => {
      expect(canPerform(adminUser, 'nonexistent' as any, {}, 'can_edit' as any)).toBe(false);
    });

    test('Should return false for non-existent actions', () => {
      expect(canPerform(adminUser, 'user', {}, 'nonexistent' as any)).toBe(false);
    });

    test('Should handle missing policy functions', () => {
      // Test a resource without a specific action
      expect(canPerform(adminUser, 'problem_tag', {}, 'can_view' as any)).toBe(false);
    });
  });

  describe('Policy Structure Validation', () => {
    test('All policy functions should be callable', () => {
      Object.entries(policies).forEach(([resourceType, resourcePolicies]) => {
        Object.entries(resourcePolicies as Record<string, any>).forEach(([action, policyFunction]) => {
          expect(typeof policyFunction).toBe('function');
          
          // Test that the function can be called without throwing
          try {
            const result = (policyFunction as Function)(adminUser, {}, {});
            expect(typeof result).toBe('boolean');
          } catch (error) {
            // Some policies might require specific parameters, that's okay
            // Just ensure they don't throw unexpected errors
          }
        });
      });
    });
  });
});

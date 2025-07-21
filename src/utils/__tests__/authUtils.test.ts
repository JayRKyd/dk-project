import { describe, it, expect } from 'vitest';
import { User } from '@supabase/supabase-js';
import { hasRole, getUserMembershipTier, isPremiumUser, getUserDisplayName, getUserRole, canAccessRoute } from '../authUtils';

describe('authUtils', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    user_metadata: {
      username: 'testuser',
      name: 'Test User',
      role: 'lady',
      membership_tier: 'pro',
    },
    app_metadata: {},
  } as unknown as User;

  const mockAdminUser = {
    id: '456',
    email: 'admin@example.com',
    user_metadata: {
      username: 'admin',
      name: 'Admin User',
      role: 'admin',
    },
    app_metadata: {
      role: 'admin',
    },
  } as unknown as User;

  describe('hasRole', () => {
    it('returns true if user has the required role in user_metadata', () => {
      expect(hasRole(mockUser, 'lady')).toBe(true);
    });

    it('returns true if user has the required role in app_metadata', () => {
      expect(hasRole(mockAdminUser, 'admin')).toBe(true);
    });

    it('returns false if user does not have the required role', () => {
      expect(hasRole(mockUser, 'admin')).toBe(false);
    });

    it('returns false if user is null', () => {
      expect(hasRole(null, 'lady')).toBe(false);
    });
  });

  describe('getUserMembershipTier', () => {
    it('returns the membership tier in uppercase', () => {
      expect(getUserMembershipTier(mockUser)).toBe('PRO');
    });

    it('returns FREE if no membership tier is set', () => {
      const user = { ...mockUser, user_metadata: {} };
      expect(getUserMembershipTier(user)).toBe('FREE');
    });

    it('returns FREE if user is null', () => {
      expect(getUserMembershipTier(null)).toBe('FREE');
    });
  });

  describe('isPremiumUser', () => {
    it('returns true for premium users', () => {
      expect(isPremiumUser(mockUser)).toBe(true);
    });

    it('returns false for free users', () => {
      const freeUser = {
        ...mockUser,
        user_metadata: { ...mockUser.user_metadata, membership_tier: 'free' },
      };
      expect(isPremiumUser(freeUser)).toBe(false);
    });
  });

  describe('getUserDisplayName', () => {
    it('returns the name from user_metadata', () => {
      expect(getUserDisplayName(mockUser)).toBe('Test User');
    });

    it('falls back to username if name is not available', () => {
      const user = {
        ...mockUser,
        user_metadata: { username: 'testuser' },
      };
      expect(getUserDisplayName(user)).toBe('testuser');
    });

    it('falls back to email if no name or username is available', () => {
      const user = { ...mockUser, user_metadata: {}, email: 'test@example.com' };
      expect(getUserDisplayName(user)).toBe('test@example.com');
    });

    it('returns Guest if user is null', () => {
      expect(getUserDisplayName(null)).toBe('Guest');
    });
  });

  describe('getUserRole', () => {
    it('returns the role from user_metadata', () => {
      expect(getUserRole(mockUser)).toBe('lady');
    });

    it('falls back to app_metadata if user_metadata has no role', () => {
      const user = {
        ...mockUser,
        user_metadata: {},
        app_metadata: { role: 'admin' },
      };
      expect(getUserRole(user)).toBe('admin');
    });

    it('defaults to client if no role is found', () => {
      const user = { ...mockUser, user_metadata: {}, app_metadata: {} };
      expect(getUserRole(user)).toBe('client');
    });
  });

  describe('canAccessRoute', () => {
    it('returns true if user has one of the allowed roles', () => {
      expect(canAccessRoute(mockUser, ['lady', 'admin'])).toBe(true);
    });

    it('returns false if user does not have any of the allowed roles', () => {
      expect(canAccessRoute(mockUser, ['club', 'admin'])).toBe(false);
    });

    it('returns true if user is admin, regardless of allowed roles', () => {
      expect(canAccessRoute(mockAdminUser, ['club'])).toBe(true);
    });

    it('returns false if user is null', () => {
      expect(canAccessRoute(null, ['lady', 'client'])).toBe(false);
    });
  });
});

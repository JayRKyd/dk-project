/**
 * Test Account Creation Script for Development
 * Creates FREE and PRO test accounts for membership testing
 */

import { supabase } from '../lib/supabase';
import { createTestUserMetadata, canCreateTestAccounts, logMembershipAction } from '../utils/developmentUtils';

interface TestAccount {
  email: string;
  name: string;
  tier: 'FREE' | 'PRO';
  password: string;
  role?: 'lady' | 'client' | 'club';
}

const testAccounts: TestAccount[] = [
  {
    email: 'test-free-lady@dk-dev.com',
    name: 'Test Free Lady',
    tier: 'FREE',
    password: 'test123456'
  },
  {
    email: 'test-pro-lady@dk-dev.com',
    name: 'Test Pro Lady',  
    tier: 'PRO',
    password: 'test123456'
  },
  {
    email: 'test-client@dk-dev.com',
    name: 'Test Client',
    tier: 'FREE',
    password: 'test123456',
    role: 'client'
  }
];

/**
 * Create a single test account
 */
async function createTestAccount(account: TestAccount): Promise<boolean> {
  try {
    logMembershipAction('Creating test account', { email: account.email, tier: account.tier });

    // 1. Create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: account.email,
      password: account.password,
      options: {
        data: createTestUserMetadata(account.tier)
      }
    });

    if (authError) {
      console.error(`❌ Failed to create auth user for ${account.email}:`, authError);
      return false;
    }

    if (!authData.user) {
      console.error(`❌ No user data returned for ${account.email}`);
      return false;
    }

    // 2. Create/update the profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: authData.user.id,
        name: account.name,
        email: account.email,
        role: account.role || 'lady',
        membership_tier: account.tier,
        is_test_account: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error(`❌ Failed to create/update profile for ${account.email}:`, profileError);
      return false;
    }

    console.log(`✅ Successfully created ${account.tier} test account: ${account.email}`);
    return true;

  } catch (error) {
    console.error(`❌ Unexpected error creating ${account.email}:`, error);
    return false;
  }
}

/**
 * Create all test accounts
 */
export async function createAllTestAccounts(): Promise<void> {
  if (!canCreateTestAccounts()) {
    console.error('❌ Test account creation is only allowed in development mode');
    return;
  }

  console.log('🧪 Starting test account creation...');
  
  let successCount = 0;
  let failureCount = 0;

  for (const account of testAccounts) {
    const success = await createTestAccount(account);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
    
    // Small delay between creations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n📊 Test Account Creation Summary:`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📧 Login credentials for all accounts: password = "test123456"`);
  
  if (successCount > 0) {
    console.log(`\n🔐 Test Accounts Created:`);
    testAccounts.forEach(account => {
      console.log(`  - ${account.tier}: ${account.email}`);
    });
  }
}

/**
 * Clean up test accounts (for development cleanup)
 */
export async function cleanupTestAccounts(): Promise<void> {
  if (!canCreateTestAccounts()) {
    console.error('❌ Test account cleanup is only allowed in development mode');
    return;
  }

  console.log('🧹 Cleaning up test accounts...');
  
  for (const account of testAccounts) {
    try {
      // Delete from profiles first
      await supabase
        .from('profiles')
        .delete()
        .eq('email', account.email)
        .eq('is_test_account', true);

      console.log(`🗑️ Cleaned up profile for ${account.email}`);
    } catch (error) {
      console.error(`❌ Error cleaning up ${account.email}:`, error);
    }
  }
  
  console.log('✅ Test account cleanup completed');
}

// Export test credentials for easy reference
export const testCredentials = {
  FREE: {
    email: 'test-free-lady@dk-dev.com',
    password: 'test123456',
    tier: 'FREE' as const
  },
  PRO: {
    email: 'test-pro-lady@dk-dev.com', 
    password: 'test123456',
    tier: 'PRO' as const
  }
}; 
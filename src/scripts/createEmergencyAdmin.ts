import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createEmergencyAdmin() {
  try {
    console.log('Creating emergency admin user...');
    
    // Create user with admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'emergency@dk-platform.com',
      password: 'Emergency123!@#',
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        username: 'emergency_admin',
        membership_tier: 'ULTRA',
        is_verified: true,
        credits: 0
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return;
    }

    console.log('Auth user created successfully:', authData.user?.id);
    console.log('Email:', authData.user?.email);
    console.log('Confirmed:', authData.user?.email_confirmed_at);

    // The trigger should automatically create the public.users record
    // Let's verify it was created
    const { data: publicUser, error: publicError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'emergency@dk-platform.com')
      .single();

    if (publicError) {
      console.error('Error checking public user:', publicError);
    } else {
      console.log('Public user created:', publicUser);
    }

    console.log('\n✅ Emergency admin created successfully!');
    console.log('📧 Email: emergency@dk-platform.com');
    console.log('🔑 Password: Emergency123!@#');
    console.log('🎯 Role: admin');
    console.log('💎 Membership: ULTRA');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createEmergencyAdmin(); 
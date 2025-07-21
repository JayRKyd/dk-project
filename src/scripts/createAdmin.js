const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://vklmgftjqwwcscivqrjm.supabase.co',
  process.env.SUPABASE_KEY || 'your-anon-key-here' // Replace with your anon key
);

const adminData = {
  email: 'admin@dk-platform.com',
  password: 'Admin123!@#',
  username: 'admin',
  name: 'Platform Administrator'
};

async function createAdmin() {
  try {
    console.log('🔐 Creating admin account...');

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminData.email,
      password: adminData.password,
      options: {
        data: {
          role: 'admin',
          username: adminData.username,
          name: adminData.name
        }
      }
    });

    if (authError) {
      console.error('❌ Failed to create admin auth user:', authError);
      return;
    }

    console.log('✅ Auth user created:', authData.user.id);

    // 2. Create admin user record
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: adminData.email,
        role: 'admin',
        membership_tier: 'ADMIN',
        is_verified: true,
        verified_at: new Date().toISOString()
      });

    if (userError) {
      console.error('❌ Failed to create user record:', userError);
      return;
    }

    console.log('✅ User record created');

    // 3. Create admin profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        username: adminData.username,
        role: 'admin',
        membership_tier: 'ADMIN'
      });

    if (profileError) {
      console.error('❌ Failed to create profile:', profileError);
      return;
    }

    console.log('✅ Profile created');
    console.log('\n🎉 Admin account created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createAdmin(); 
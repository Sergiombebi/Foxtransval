// Insérer des utilisateurs directement via l'API Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://obfjghpaxhhgzheyuoig.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZmpnaHBheGhoZ3poZXl1b2lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzgwODksImV4cCI6MjA5MjgxNDA4OX0.TODrv0dYAYZ5MRzd5ZS8t7pt2FiPAzJe6qUcoLMekxs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertUsers() {
  try {
    console.log('Insertion des utilisateurs...');
    
    // Utilisateur admin
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .insert([
        {
          email: 'admin@foxtransval.com',
          name: 'Administrateur',
          password_hash: 'admin123',
          role: 'admin',
          created_at: new Date().toISOString()
        }
      ]);
    
    if (adminError) {
      console.error('❌ Erreur insertion admin:', adminError.message);
    } else {
      console.log('✅ Admin créé avec succès');
    }
    
    // Utilisateur test
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          email: 'user@test.com',
          name: 'Utilisateur Test',
          password_hash: 'test123',
          role: 'user',
          created_at: new Date().toISOString()
        }
      ]);
    
    if (userError) {
      console.error('❌ Erreur insertion user:', userError.message);
    } else {
      console.log('✅ Utilisateur test créé avec succès');
    }
    
    // Vérifier les utilisateurs
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('❌ Erreur récupération users:', usersError.message);
    } else {
      console.log(`📋 ${users.length} utilisateur(s) trouvé(s):`);
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.role}) - ${user.name}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Erreur générale:', err.message);
  }
}

insertUsers();

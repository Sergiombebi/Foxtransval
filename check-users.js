// Vérification détaillée des utilisateurs
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://obfjghpaxhhgzheyuoig.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZmpnaHBheGhoZ3poZXl1b2lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzgwODksImV4cCI6MjA5MjgxNDA4OX0.TODrv0dYAYZ5MRzd5ZS8t7pt2FiPAzJe6qUcoLMekxs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUsers() {
  try {
    console.log('Vérification des utilisateurs...');
    
    // Test 1: Compter les utilisateurs
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erreur comptage:', countError.message);
    } else {
      console.log(`📊 Nombre d'utilisateurs: ${count}`);
    }
    
    // Test 2: Lister tous les utilisateurs
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('❌ Erreur listing:', usersError.message);
      console.error('   Code:', usersError.code);
    } else {
      console.log(`📋 ${users.length} utilisateur(s) trouvé(s):`);
      users.forEach(user => {
        console.log(`  - Email: ${user.email}`);
        console.log(`    Nom: ${user.name}`);
        console.log(`    Rôle: ${user.role}`);
        console.log(`    Password: ${user.password_hash}`);
        console.log('');
      });
    }
    
    // Test 3: Recherche spécifique admin
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@foxtransval.com')
      .single();
    
    if (adminError) {
      console.error('❌ Erreur recherche admin:', adminError.message);
    } else {
      console.log('✅ Admin trouvé:', admin.email);
    }
    
  } catch (err) {
    console.error('❌ Erreur générale:', err.message);
  }
}

checkUsers();

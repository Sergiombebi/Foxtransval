// Test de connexion Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://obfjghpaxhhgzheyuoig.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZmpnaHBheGhoZ3poZXl1b2lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzgwODksImV4cCI6MjA5MjgxNDA4OX0.TODrv0dYAYZ5MRzd5ZS8t7pt2FiPAzJe6qUcoLMekxs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('Test de connexion à Supabase...');
    
    // Test 1: Vérifier la connexion
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      return;
    }
    
    console.log('✅ Connexion réussie à Supabase');
    
    // Test 2: Lister les utilisateurs
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError.message);
      return;
    }
    
    console.log(`📋 ${users.length} utilisateur(s) trouvé(s):`);
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
    
  } catch (err) {
    console.error('❌ Erreur générale:', err.message);
  }
}

testConnection();

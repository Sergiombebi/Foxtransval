// Vérifier les tables dans la base Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://obfjghpaxhhgzheyuoig.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZmpnaHBheGhoZ3poZXl1b2lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzgwODksImV4cCI6MjA5MjgxNDA4OX0.TODrv0dYAYZ5MRzd5ZS8t7pt2FiPAzJe6qUcoLMekxs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  try {
    console.log('Vérification des tables...');
    
    // Test direct sur la table users
    console.log('\n📋 Test table users:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (usersError) {
      console.error('❌ Erreur table users:', usersError.message);
      console.error('   Code:', usersError.code);
      console.error('   Details:', usersError.details);
    } else {
      console.log(`✅ Table users accessible - ${users} utilisateur(s)`);
    }
    
    // Lister toutes les tables (requête system)
    console.log('\n📋 Tables disponibles:');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names');
    
    if (tablesError) {
      console.log('ℹ️  Impossible de lister les tables (permission refusée)');
    } else {
      console.log('Tables trouvées:', tables);
    }
    
  } catch (err) {
    console.error('❌ Erreur générale:', err.message);
  }
}

checkTables();

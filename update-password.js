const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Lire le fichier .env.local
const envPath = path.join(__dirname, '.env.local');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf-8');
}

// Parser les variables d'environnement
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variables d\'environnement manquantes dans .env.local');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

async function updateAdminPassword() {
  try {
    console.log('=== Mise à jour du mot de passe admin ===\n');
    console.log('URL Supabase:', supabaseUrl);
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const newHash = '$2b$12$Wyr/2324k0d6To6ohA1n9e5TQ46v4rEzu237zJRZbpbgS2Zl1a2Qe';
    
    const { data, error } = await supabase
      .from('users')
      .update({ password_hash: newHash })
      .eq('email', 'admin@trascolis.com');
    
    if (error) {
      console.error('Erreur lors de la mise à jour:', error);
      process.exit(1);
    }
    
    console.log('✓ Mot de passe admin mis à jour avec succès');
    console.log('Email: admin@trascolis.com');
    console.log('Mot de passe: admin123');
  } catch (err) {
    console.error('Erreur:', err);
    process.exit(1);
  }
}

updateAdminPassword();

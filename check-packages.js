const { createClient } = require('@supabase/supabase-js');

// Remplacez ces valeurs par vos vraies clés Supabase
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPackages() {
  try {
    const { data, error } = await supabase.from('packages').select('tracking_number, client_name, status');
    if (error) {
      console.error('Erreur:', error);
    } else {
      console.log('Colis disponibles:');
      data.forEach(pkg => {
        console.log(`- ${pkg.tracking_number} (${pkg.client_name}) - ${pkg.status}`);
      });
    }
  } catch (err) {
    console.error('Erreur générale:', err);
  }
}

checkPackages();

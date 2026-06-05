const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'admin123';
  const saltRounds = 12;
  
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Hash généré pour "admin123":');
  console.log(hash);
  
  // Vérifier que le hash fonctionne
  const isValid = await bcrypt.compare(password, hash);
  console.log('\nVérification du hash:', isValid ? '✓ Valide' : '✗ Invalide');
}

generateHash().catch(console.error);

-- Créer l'utilisateur admin par défaut
INSERT INTO users (id, email, name, password_hash, role, created_at)
VALUES (
  gen_random_uuid(),
  'admin@foxtransval.com',
  'Administrateur',
  'admin123', -- Mot de passe simple pour le test
  'admin',
  NOW()
);

-- Créer un utilisateur test
INSERT INTO users (id, email, name, password_hash, role, created_at)
VALUES (
  gen_random_uuid(),
  'user@test.com',
  'Utilisateur Test',
  'test123', -- Mot de passe simple pour le test
  'user',
  NOW()
);

-- Vérifier les utilisateurs créés
SELECT * FROM users;

-- Désactiver temporairement RLS sur la table packages pour le développement
ALTER TABLE packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_updates DISABLE ROW LEVEL SECURITY;

-- Pour réactiver plus tard :
-- ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tracking_updates ENABLE ROW LEVEL SECURITY;

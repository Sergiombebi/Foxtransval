-- Correction des politiques RLS pour permettre l'ajout de colis
-- sans authentification Supabase (pour le développement local)

-- Supprimer les politiques existantes sur packages
DROP POLICY IF EXISTS "Anyone can view packages" ON packages;
DROP POLICY IF EXISTS "Admins can insert packages" ON packages;
DROP POLICY IF EXISTS "Admins can update packages" ON packages;
DROP POLICY IF EXISTS "Admins can delete packages" ON packages;

-- Créer de nouvelles politiques plus permissives pour le développement
CREATE POLICY "Anyone can view packages" ON packages
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert packages" ON packages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update packages" ON packages
    FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete packages" ON packages
    FOR DELETE USING (true);

-- Appliquer les mêmes corrections pour tracking_updates
DROP POLICY IF EXISTS "Anyone can view tracking updates" ON tracking_updates;
DROP POLICY IF EXISTS "Admins can manage tracking updates" ON tracking_updates;

CREATE POLICY "Anyone can view tracking updates" ON tracking_updates
    FOR SELECT USING (true);

CREATE POLICY "Anyone can manage tracking updates" ON tracking_updates
    FOR ALL USING (true);

-- =============================================
-- FoxTransval Database Schema
-- =============================================

-- Table des utilisateurs (pour le login)
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Table des colis
CREATE TABLE packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    sender VARCHAR(255),
    recipient VARCHAR(255),
    origin VARCHAR(255),
    destination VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (
        status IN (
            'pending', 'shipped', 'in_transit', 'customs', 
            'out_for_delivery', 'delivered', 'lost', 'returned',
            'recu_par_transitaire', 'en_expedition', 'arrivee', 'recuperation'
        )
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    current_location VARCHAR(255),
    weight DECIMAL(10, 2),
    dimensions_length DECIMAL(10, 2),
    dimensions_width DECIMAL(10, 2),
    dimensions_height DECIMAL(10, 2),
    
    -- Champs supplémentaires requis
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    nature VARCHAR(255) NOT NULL, -- Nature du colis (électroniques, vêtements, etc.)
    departure_date TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_date TIMESTAMP WITH TIME ZONE NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL, -- en kg
    price_per_kg DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    departure_country VARCHAR(255) NOT NULL,
    arrival_country VARCHAR(255) NOT NULL,
    arrival_city VARCHAR(255) NOT NULL,
    package_image TEXT -- URL ou base64 de l'image
);

-- Table des mises à jour de suivi
CREATE TABLE tracking_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les performances
CREATE INDEX idx_packages_tracking_number ON packages(tracking_number);
CREATE INDEX idx_packages_status ON packages(status);
CREATE INDEX idx_packages_client_name ON packages(client_name);
CREATE INDEX idx_tracking_updates_package_id ON tracking_updates(package_id);
CREATE INDEX idx_users_email ON users(email);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_packages_updated_at 
    BEFORE UPDATE ON packages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insertion d'un utilisateur admin par défaut (mot de passe: admin123)
INSERT INTO users (email, name, password_hash, role) 
VALUES (
    'admin@foxtransval.com', 
    'Administrateur', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', -- bcrypt hash de 'admin123'
    'admin'
);

-- Politiques RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_updates ENABLE ROW LEVEL SECURITY;

-- Politiques pour les utilisateurs
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Politiques pour les colis (tout le monde peut voir, seul admin peut modifier)
CREATE POLICY "Anyone can view packages" ON packages
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert packages" ON packages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can update packages" ON packages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete packages" ON packages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Politiques pour les mises à jour de suivi
CREATE POLICY "Anyone can view tracking updates" ON tracking_updates
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage tracking updates" ON tracking_updates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

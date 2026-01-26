-- HomeCraft - Script SQL Complet
-- Ce script crée toutes les tables et insère les données de test

-- ===============================================
-- PARTIE 1 : SUPPRESSION DES TABLES EXISTANTES (si elles existent)
-- ===============================================

DROP TABLE IF EXISTS furniture CASCADE;
DROP TABLE IF EXISTS furniture_categories CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ===============================================
-- PARTIE 2 : CRÉATION DES TABLES
-- ===============================================

-- Table: partners (Enseignes)
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: furniture_categories (Catégories de meubles)
CREATE TABLE furniture_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: profiles (Profils utilisateurs)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: projects (Projets d'aménagement)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  room_data JSONB,
  furniture_placements JSONB,
  room_image_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: furniture (Meubles)
CREATE TABLE furniture (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT,
  width NUMERIC,
  height NUMERIC,
  depth NUMERIC,
  price NUMERIC,
  description TEXT,
  category_id UUID REFERENCES furniture_categories(id) ON DELETE SET NULL,
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  image_url TEXT,
  model_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===============================================
-- PARTIE 3 : INDEX POUR PERFORMANCES
-- ===============================================

CREATE INDEX idx_furniture_category ON furniture(category_id);
CREATE INDEX idx_furniture_partner ON furniture(partner_id);
CREATE INDEX idx_furniture_active ON furniture(is_active);
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_profiles_user ON profiles(user_id);

-- ===============================================
-- PARTIE 4 : ROW LEVEL SECURITY (RLS)
-- ===============================================

-- Activer RLS sur toutes les tables
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE furniture_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE furniture ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policies pour partners (lecture publique)
CREATE POLICY "Allow public read access to partners"
  ON partners FOR SELECT
  TO public
  USING (true);

-- Policies pour furniture_categories (lecture publique)
CREATE POLICY "Allow public read access to categories"
  ON furniture_categories FOR SELECT
  TO public
  USING (true);

-- Policies pour furniture (lecture publique)
CREATE POLICY "Allow public read access to furniture"
  ON furniture FOR SELECT
  TO public
  USING (true);

-- Policies pour profiles (CRUD basé sur user_id)
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies pour projects (CRUD basé sur user_id)
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ===============================================
-- PARTIE 5 : INSERTION DES DONNÉES DE TEST
-- ===============================================

-- 1. Partners (Enseignes)
INSERT INTO partners (name, slug, description, website_url, is_active) VALUES
('Ikea', 'ikea', 'Meubles scandinaves abordables et design', 'https://www.ikea.com/fr/fr/', true),
('Conforama', 'conforama', 'Meubles et décoration pour toute la maison', 'https://www.conforama.fr/', true),
('Maisons du Monde', 'maisons-du-monde', 'Mobilier et décoration tendance', 'https://www.maisonsdumonde.com/', true),
('BUT', 'but', 'Meubles, décoration et électroménager', 'https://www.but.fr/', true),
('La Redoute', 'la-redoute', 'Mobilier et décoration française', 'https://www.laredoute.fr/', true);

-- 2. Categories
INSERT INTO furniture_categories (name, slug, icon) VALUES
('Salon', 'salon', 'sofa'),
('Chambre', 'chambre', 'bed'),
('Bureau', 'bureau', 'desk'),
('Salle à manger', 'salle-a-manger', 'utensils'),
('Rangement', 'rangement', 'archive'),
('Éclairage', 'eclairage', 'lamp');

-- 3. Furniture Items (70+ items)

-- === SALON === --

-- Canapés
INSERT INTO furniture (name, color, width, height, depth, price, description, category_id, partner_id, is_active)
VALUES
('EKTORP Canapé 3 places', '#8B7355', 2.18, 0.88, 0.88, 399.00, 'Canapé classique et confortable avec housse amovible', (SELECT id FROM furniture_categories WHERE slug = 'salon'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('KLIPPAN Canapé 2 places', '#4A5568', 1.80, 0.66, 0.88, 249.00, 'Canapé compact et durable, parfait pour petits espaces', (SELECT id FROM furniture_categories WHERE slug = 'salon'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('NORSBORG Canapé d''angle', '#6B7280', 2.81, 0.85, 2.25, 899.00, 'Grand canapé d''angle modulable', (SELECT id FROM furniture_categories WHERE slug = 'salon'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('KIVIK Canapé 3 places', '#2C3E50', 2.28, 0.83, 0.95, 549.00, 'Canapé spacieux et profond pour un confort maximal', (SELECT id FROM furniture_categories WHERE slug = 'salon'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('BROADWAY Canapé 3 places', '#34495E', 2.20, 0.90, 0.95, 449.00, 'Canapé moderne avec pieds en métal', (SELECT id FROM furniture_categories WHERE slug = 'salon'), (SELECT id FROM partners WHERE slug = 'conforama'), true),
('STOCKHOLM Canapé 3 places', '#556B2F', 2.30, 0.85, 0.92, 599.00, 'Design scandinave avec pieds en chêne', (SELECT id FROM furniture_categories WHERE slug = 'salon'), (SELECT id FROM partners WHERE slug = 'maisons-du-monde'), true),
('NEWPORT Canapé d''angle', '#8B4513', 2.60, 0.88, 2.10, 799.00, 'Style bord de mer chic et confortable', (SELECT id FROM furniture_categories WHERE slug = 'salon'), (SELECT id FROM partners WHERE slug = 'maisons-du-monde'), true);

-- Fauteuils
INSERT INTO furniture (name, color, width, height, depth, price, description, category_id, partner_id, is_active)
VALUES
('STRANDMON Fauteuil à oreilles', '#92400E', 0.82, 1.01, 0.96, 249.00, 'Fauteuil classique avec dossier haut', (SELECT id FROM furniture_categories WHERE slug = 'salon'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('POÄNG Fauteuil', '#D2691E', 0.68, 1.00, 0.82, 99.00, 'Fauteuil à bascule en bouleau courbé', (SELECT id FROM furniture_categories WHERE slug = 'salon'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('AUSTIN Fauteuil club', '#8B4726', 0.85, 0.85, 0.90, 299.00, 'Fauteuil club en cuir vieilli', (SELECT id FROM furniture_categories WHERE slug = 'salon'), (SELECT id FROM partners WHERE slug = 'conforama'), true),
('GATSBY Fauteuil velours', '#4B0082', 0.80, 0.82, 0.88, 349.00, 'Fauteuil en velours style art déco', (SELECT id FROM furniture_categories WHERE slug = 'salon'), (SELECT id FROM partners WHERE slug = 'maisons-du-monde'), true);

-- Tables basses
INSERT INTO furniture (name, color, width, height, depth, price, description, category_id, partner_id, is_active)
VALUES
('LACK Table basse', '#000000', 0.90, 0.45, 0.55, 29.00, 'Table basse simple et économique', (SELECT id FROM furniture_categories WHERE slug = 'salon'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('LIATORP Table basse', '#FFFFFF', 0.93, 0.51, 0.93, 149.00, 'Table basse avec plateau vitré et rangement', (SELECT id FROM furniture_categories WHERE slug = 'salon'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('HEMNES Table basse', '#654321', 0.90, 0.46, 0.90, 179.00, 'Table basse en pin massif teinté', (SELECT id FROM furniture_categories WHERE slug = 'salon'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('LISABO Table basse', '#8B7355', 1.18, 0.50, 0.50, 99.00, 'Design scandinave épuré', (SELECT id FROM furniture_categories WHERE slug = 'salon'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('INDUSTRIAL Table basse', '#2F4F4F', 1.20, 0.45, 0.60, 219.00, 'Table basse style industriel métal et bois', (SELECT id FROM furniture_categories WHERE slug = 'salon'), (SELECT id FROM partners WHERE slug = 'but'), true);

-- === CHAMBRE === --

-- Lits
INSERT INTO furniture (name, color, width, height, depth, price, description, category_id, partner_id, is_active)
VALUES
('MALM Lit double', '#8B4513', 1.60, 0.38, 2.09, 179.00, 'Lit double avec rangement intégré', (SELECT id FROM furniture_categories WHERE slug = 'chambre'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('HEMNES Lit double', '#654321', 1.64, 1.20, 2.12, 299.00, 'Lit traditionnel en pin massif', (SELECT id FROM furniture_categories WHERE slug = 'chambre'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('TARVA Lit double', '#DEB887', 1.50, 0.92, 2.09, 129.00, 'Lit simple en pin naturel', (SELECT id FROM furniture_categories WHERE slug = 'chambre'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('SONGESAND Lit double', '#F5F5DC', 1.60, 0.95, 2.07, 249.00, 'Lit avec rangements tiroirs', (SELECT id FROM furniture_categories WHERE slug = 'chambre'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('STOCKHOLM Lit King Size', '#D4A373', 1.90, 0.50, 2.20, 599.00, 'Lit king size élégant avec tête de lit capitonnée', (SELECT id FROM furniture_categories WHERE slug = 'chambre'), (SELECT id FROM partners WHERE slug = 'maisons-du-monde'), true),
('BOHÈME Lit 160x200', '#8FBC8F', 1.60, 1.30, 2.10, 449.00, 'Lit en rotin naturel style bohème', (SELECT id FROM furniture_categories WHERE slug = 'chambre'), (SELECT id FROM partners WHERE slug = 'maisons-du-monde'), true),
('PREMIUM Lit King Size', '#483D8B', 1.80, 1.10, 2.10, 699.00, 'Lit coffre avec sommier relevable', (SELECT id FROM furniture_categories WHERE slug = 'chambre'), (SELECT id FROM partners WHERE slug = 'but'), true);

-- Tables de chevet
INSERT INTO furniture (name, color, width, height, depth, price, description, category_id, partner_id, is_active)
VALUES
('MALM Table de chevet', '#8B4513', 0.40, 0.55, 0.48, 39.00, 'Table de chevet avec tiroir', (SELECT id FROM furniture_categories WHERE slug = 'chambre'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('HEMNES Table de chevet', '#654321', 0.46, 0.61, 0.35, 69.00, 'Table de chevet 2 tiroirs pin massif', (SELECT id FROM furniture_categories WHERE slug = 'chambre'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('NORDLI Table de chevet', '#FFFFFF', 0.40, 0.54, 0.40, 79.00, 'Table de chevet modulaire', (SELECT id FROM furniture_categories WHERE slug = 'chambre'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('VINTAGE Table de chevet', '#CD853F', 0.45, 0.60, 0.38, 89.00, 'Style vintage bois et métal', (SELECT id FROM furniture_categories WHERE slug = 'chambre'), (SELECT id FROM partners WHERE slug = 'la-redoute'), true);

-- === BUREAU === --

-- Bureaux
INSERT INTO furniture (name, color, width, height, depth, price, description, category_id, partner_id, is_active)
VALUES
('MICKE Bureau', '#FFFFFF', 1.42, 0.75, 0.50, 79.00, 'Bureau compact avec rangement intégré', (SELECT id FROM furniture_categories WHERE slug = 'bureau'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('ALEX Bureau', '#2F4F4F', 1.31, 0.76, 0.58, 149.00, 'Bureau avec tiroirs et gestion des câbles', (SELECT id FROM furniture_categories WHERE slug = 'bureau'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('BEKANT Bureau', '#1F2937', 1.60, 0.65, 0.80, 249.00, 'Bureau réglable en hauteur', (SELECT id FROM furniture_categories WHERE slug = 'bureau'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('MALM Bureau', '#8B4513', 1.40, 0.73, 0.65, 169.00, 'Bureau avec tablette coulissante', (SELECT id FROM furniture_categories WHERE slug = 'bureau'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('LINCOLN Bureau d''angle', '#1F2937', 1.60, 0.75, 1.60, 279.00, 'Bureau d''angle spacieux pour home office', (SELECT id FROM furniture_categories WHERE slug = 'bureau'), (SELECT id FROM partners WHERE slug = 'but'), true),
('HIBA Bureau', '#B8860B', 1.20, 0.76, 0.60, 329.00, 'Bureau en chêne massif', (SELECT id FROM furniture_categories WHERE slug = 'bureau'), (SELECT id FROM partners WHERE slug = 'la-redoute'), true),
('MODERN Bureau', '#696969', 1.40, 0.75, 0.70, 199.00, 'Bureau moderne piètement métal', (SELECT id FROM furniture_categories WHERE slug = 'bureau'), (SELECT id FROM partners WHERE slug = 'conforama'), true);

-- Chaises de bureau
INSERT INTO furniture (name, color, width, height, depth, price, description, category_id, partner_id, is_active)
VALUES
('MARKUS Chaise de bureau', '#000000', 0.62, 1.40, 0.60, 199.00, 'Chaise ergonomique avec soutien lombaire', (SELECT id FROM furniture_categories WHERE slug = 'bureau'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('JÄRVFJÄLLET Chaise bureau', '#4B5563', 0.68, 1.10, 0.68, 249.00, 'Chaise avec accoudoirs réglables', (SELECT id FROM furniture_categories WHERE slug = 'bureau'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('FLINTAN Chaise de bureau', '#1E3A5F', 0.74, 1.18, 0.69, 79.00, 'Chaise de bureau avec accoudoirs', (SELECT id FROM furniture_categories WHERE slug = 'bureau'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('GAMING Chaise gamer', '#DC143C', 0.70, 1.30, 0.65, 169.00, 'Chaise gamer ergonomique', (SELECT id FROM furniture_categories WHERE slug = 'bureau'), (SELECT id FROM partners WHERE slug = 'conforama'), true);

-- === SALLE À MANGER === --

-- Tables à manger
INSERT INTO furniture (name, color, width, height, depth, price, description, category_id, partner_id, is_active)
VALUES
('INGATORP Table extensible', '#5D4037', 1.55, 0.74, 0.87, 249.00, 'Table extensible jusqu''à 215 cm', (SELECT id FROM furniture_categories WHERE slug = 'salle-a-manger'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('EKEDALEN Table', '#8B7355', 1.80, 0.75, 0.90, 299.00, 'Table à manger rectangulaire en bois', (SELECT id FROM furniture_categories WHERE slug = 'salle-a-manger'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('MÖRBYLÅNGA Table', '#654321', 2.20, 0.74, 1.00, 549.00, 'Grande table en chêne plaqué', (SELECT id FROM furniture_categories WHERE slug = 'salle-a-manger'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('LISABO Table', '#D2B48C', 1.40, 0.74, 0.78, 199.00, 'Table compacte design scandinave', (SELECT id FROM furniture_categories WHERE slug = 'salle-a-manger'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('PORTOBELLO Table', '#8B4513', 1.80, 0.76, 0.95, 449.00, 'Table en bois massif style industriel', (SELECT id FROM furniture_categories WHERE slug = 'salle-a-manger'), (SELECT id FROM partners WHERE slug = 'maisons-du-monde'), true),
('AUTHENTIC Table ronde', '#A0522D', 1.20, 0.75, 1.20, 379.00, 'Table ronde extensible', (SELECT id FROM furniture_categories WHERE slug = 'salle-a-manger'), (SELECT id FROM partners WHERE slug = 'but'), true);

-- Chaises salle à manger
INSERT INTO furniture (name, color, width, height, depth, price, description, category_id, partner_id, is_active)
VALUES
('STEFAN Chaise', '#654321', 0.42, 0.90, 0.49, 29.00, 'Chaise en pin massif teinté', (SELECT id FROM furniture_categories WHERE slug = 'salle-a-manger'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('INGOLF Chaise', '#8B7355', 0.43, 0.91, 0.50, 69.00, 'Chaise traditionnelle en pin', (SELECT id FROM furniture_categories WHERE slug = 'salle-a-manger'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('EKEDALEN Chaise', '#696969', 0.43, 0.95, 0.51, 99.00, 'Chaise en bois et métal', (SELECT id FROM furniture_categories WHERE slug = 'salle-a-manger'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('BAROQUE Chaise', '#F5DEB3', 0.48, 1.00, 0.52, 119.00, 'Chaise capitonnée style baroque', (SELECT id FROM furniture_categories WHERE slug = 'salle-a-manger'), (SELECT id FROM partners WHERE slug = 'maisons-du-monde'), true);

-- === RANGEMENT === --

-- Bibliothèques
INSERT INTO furniture (name, color, width, height, depth, price, description, category_id, partner_id, is_active)
VALUES
('BILLY Bibliothèque', '#654321', 0.80, 2.02, 0.28, 49.00, 'Bibliothèque classique et modulable', (SELECT id FROM furniture_categories WHERE slug = 'rangement'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('BILLY Bibliothèque large', '#FFFFFF', 1.20, 2.37, 0.28, 99.00, 'Grande bibliothèque 5 étagères', (SELECT id FROM furniture_categories WHERE slug = 'rangement'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('HEMNES Bibliothèque', '#654321', 0.90, 1.98, 0.37, 179.00, 'Bibliothèque en pin massif', (SELECT id FROM furniture_categories WHERE slug = 'rangement'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('LIATORP Bibliothèque', '#F5F5DC', 0.96, 2.14, 0.37, 299.00, 'Bibliothèque vitrée style cottage', (SELECT id FROM furniture_categories WHERE slug = 'rangement'), (SELECT id FROM partners WHERE slug = 'ikea'), true);

-- Étagères
INSERT INTO furniture (name, color, width, height, depth, price, description, category_id, partner_id, is_active)
VALUES
('KALLAX Étagère 2x2', '#8B7355', 0.77, 0.77, 0.39, 39.00, 'Étagère cube 4 cases', (SELECT id FROM furniture_categories WHERE slug = 'rangement'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('KALLAX Étagère 4x4', '#FFFFFF', 1.47, 1.47, 0.39, 89.00, 'Étagère cube polyvalente 16 cases', (SELECT id FROM furniture_categories WHERE slug = 'rangement'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('EKET Combinaison', '#696969', 1.05, 0.70, 0.35, 120.00, 'Rangement mural modulaire', (SELECT id FROM furniture_categories WHERE slug = 'rangement'), (SELECT id FROM partners WHERE slug = 'ikea'), true);

-- Armoires
INSERT INTO furniture (name, color, width, height, depth, price, description, category_id, partner_id, is_active)
VALUES
('PAX Armoire', '#FFFFFF', 1.50, 2.36, 0.58, 350.00, 'Armoire-penderie personnalisable', (SELECT id FROM furniture_categories WHERE slug = 'rangement'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('BRIMNES Armoire 3 portes', '#000000', 1.17, 1.90, 0.50, 249.00, 'Armoire avec miroir intégré', (SELECT id FROM furniture_categories WHERE slug = 'rangement'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('KLEPPSTAD Armoire', '#F5F5DC', 1.17, 1.76, 0.55, 199.00, 'Armoire 2 portes style scandinave', (SELECT id FROM furniture_categories WHERE slug = 'rangement'), (SELECT id FROM partners WHERE slug = 'ikea'), true);

-- === ÉCLAIRAGE === --

-- Lampadaires
INSERT INTO furniture (name, color, width, height, depth, price, description, category_id, partner_id, is_active)
VALUES
('NOT Lampadaire', '#2F4F4F', 0.28, 1.75, 0.28, 19.00, 'Lampadaire simple et élégant', (SELECT id FROM furniture_categories WHERE slug = 'eclairage'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('HEKTAR Lampadaire', '#708090', 0.26, 1.76, 0.26, 49.00, 'Lampadaire style industriel', (SELECT id FROM furniture_categories WHERE slug = 'eclairage'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('RANARP Lampadaire', '#000000', 0.30, 1.55, 0.30, 69.00, 'Lampadaire de lecture orientable', (SELECT id FROM furniture_categories WHERE slug = 'eclairage'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('SKAFTET Lampadaire', '#DAA520', 0.28, 1.64, 0.28, 89.00, 'Lampadaire laiton et marbre', (SELECT id FROM furniture_categories WHERE slug = 'eclairage'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('TRIO Lampadaire', '#C0C0C0', 0.35, 1.80, 0.35, 79.00, 'Lampadaire trépied style nordique', (SELECT id FROM furniture_categories WHERE slug = 'eclairage'), (SELECT id FROM partners WHERE slug = 'conforama'), true);

-- Lampes de table
INSERT INTO furniture (name, color, width, height, depth, price, description, category_id, partner_id, is_active)
VALUES
('FADO Lampe de table', '#FFFFFF', 0.25, 0.25, 0.25, 14.00, 'Lampe boule en verre', (SELECT id FROM furniture_categories WHERE slug = 'eclairage'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('LAMPAN Lampe de table', '#2F4F4F', 0.19, 0.29, 0.19, 5.00, 'Petite lampe économique', (SELECT id FROM furniture_categories WHERE slug = 'eclairage'), (SELECT id FROM partners WHERE slug = 'ikea'), true),
('ARÖD Lampe de bureau', '#000000', 0.13, 0.45, 0.10, 39.00, 'Lampe de bureau orientable', (SELECT id FROM furniture_categories WHERE slug = 'eclairage'), (SELECT id FROM partners WHERE slug = 'ikea'), true);

-- ===============================================
-- PARTIE 6 : CONFIRMATION
-- ===============================================

-- Afficher un résumé des données insérées
SELECT 'Partners' AS table_name, COUNT(*) AS count FROM partners
UNION ALL
SELECT 'Categories', COUNT(*) FROM furniture_categories
UNION ALL
SELECT 'Furniture', COUNT(*) FROM furniture
UNION ALL
SELECT 'Projects', COUNT(*) FROM projects
UNION ALL
SELECT 'Profiles', COUNT(*) FROM profiles;

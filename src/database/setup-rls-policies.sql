-- ===============================================
-- HomeCraft - Configuration Row Level Security (RLS)
-- Ce script supprime toutes les anciennes policies et en crée de nouvelles correctes
-- ===============================================

-- ===============================================
-- ÉTAPE 1 : SUPPRIMER TOUTES LES ANCIENNES POLICIES
-- ===============================================

-- Désactiver RLS temporairement pour nettoyer
ALTER TABLE partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE furniture_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE furniture DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les policies existantes
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Supprimer les policies de partners
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'partners') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON partners';
    END LOOP;

    -- Supprimer les policies de furniture_categories
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'furniture_categories') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON furniture_categories';
    END LOOP;

    -- Supprimer les policies de furniture
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'furniture') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON furniture';
    END LOOP;

    -- Supprimer les policies de profiles
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles';
    END LOOP;

    -- Supprimer les policies de projects
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'projects') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON projects';
    END LOOP;
END $$;

-- ===============================================
-- ÉTAPE 2 : RÉACTIVER RLS SUR TOUTES LES TABLES
-- ===============================================

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE furniture_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE furniture ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- ÉTAPE 3 : CRÉER LES BONNES POLICIES
-- ===============================================

-- ============ TABLE: partners ============
-- Lecture publique uniquement (pas de modification)

CREATE POLICY "Allow public read access to partners"
  ON partners
  FOR SELECT
  TO public
  USING (true);

-- ============ TABLE: furniture_categories ============
-- Lecture publique uniquement (pas de modification)

CREATE POLICY "Allow public read access to categories"
  ON furniture_categories
  FOR SELECT
  TO public
  USING (true);

-- ============ TABLE: furniture ============
-- Lecture publique uniquement (pas de modification)

CREATE POLICY "Allow public read access to furniture"
  ON furniture
  FOR SELECT
  TO public
  USING (true);

-- ============ TABLE: profiles ============
-- Chaque utilisateur peut uniquement gérer son propre profil

-- SELECT : Voir son propre profil
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT : Créer son propre profil
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE : Modifier son propre profil
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE : Supprimer son propre profil (optionnel, peut être retiré si non souhaité)
CREATE POLICY "Users can delete their own profile"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============ TABLE: projects ============
-- Chaque utilisateur peut uniquement gérer ses propres projets
-- Lecture possible aussi pour les projets publics

-- SELECT : Voir ses propres projets OU les projets publics
CREATE POLICY "Users can view their own projects or public projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

-- INSERT : Créer un projet uniquement pour soi-même
CREATE POLICY "Users can insert their own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE : Modifier uniquement ses propres projets
CREATE POLICY "Users can update their own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE : Supprimer uniquement ses propres projets
CREATE POLICY "Users can delete their own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ===============================================
-- ÉTAPE 4 : VÉRIFICATION - Afficher toutes les policies créées
-- ===============================================

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ===============================================
-- RÉSUMÉ DES POLICIES CRÉÉES
-- ===============================================

/*
✅ partners (1 policy)
   - Allow public read access to partners (SELECT pour public)

✅ furniture_categories (1 policy)
   - Allow public read access to categories (SELECT pour public)

✅ furniture (1 policy)
   - Allow public read access to furniture (SELECT pour public)

✅ profiles (4 policies)
   - Users can view their own profile (SELECT)
   - Users can insert their own profile (INSERT)
   - Users can update their own profile (UPDATE)
   - Users can delete their own profile (DELETE)

✅ projects (4 policies)
   - Users can view their own projects or public projects (SELECT)
   - Users can insert their own projects (INSERT)
   - Users can update their own projects (UPDATE)
   - Users can delete their own projects (DELETE)

TOTAL : 11 policies de sécurité
*/

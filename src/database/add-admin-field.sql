-- ===============================================
-- HomeCraft - Ajout du champ is_admin dans profiles
-- À exécuter dans SQL Editor de Supabase
-- ===============================================

-- Ajouter la colonne is_admin (défaut: false)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Créer un index pour les requêtes admin
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- ===============================================
-- Pour te définir comme admin, exécute ensuite :
-- (remplace 'ton-email@example.com' par ton email)
-- ===============================================

-- UPDATE profiles
-- SET is_admin = true
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'ton-email@example.com');

-- OU si tu connais ton user_id directement :
-- UPDATE profiles SET is_admin = true WHERE user_id = 'ton-user-id-ici';

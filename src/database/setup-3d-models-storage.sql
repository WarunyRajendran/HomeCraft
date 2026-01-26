-- ===============================================
-- HomeCraft - Storage pour modèles 3D (GLTF/GLB)
-- ===============================================

-- ÉTAPE 1: Créer le bucket manuellement dans Supabase Dashboard
-- ============================================================
-- 1. Allez dans Storage > New Bucket
-- 2. Nom: "furniture-models"
-- 3. Cochez "Public bucket" (important pour que les modèles soient accessibles)
-- 4. Cliquez "Create bucket"

-- ÉTAPE 2: Exécuter ce script dans SQL Editor
-- ============================================================

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Public read access for furniture models" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload furniture models" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update furniture models" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete furniture models" ON storage.objects;

-- Policy 1: Lecture publique des modèles 3D
CREATE POLICY "Public read access for furniture models"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'furniture-models');

-- Policy 2: Upload par utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload furniture models"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'furniture-models');

-- Policy 3: Modification par utilisateurs authentifiés
CREATE POLICY "Authenticated users can update furniture models"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'furniture-models');

-- Policy 4: Suppression par utilisateurs authentifiés
CREATE POLICY "Authenticated users can delete furniture models"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'furniture-models');

-- ===============================================
-- ÉTAPE 3: Uploader des modèles 3D
-- ===============================================
-- 1. Téléchargez des modèles gratuits depuis:
--    - Sketchfab (filtrer par "Downloadable" et licence gratuite)
--    - Poly Pizza (https://poly.pizza) - modèles gratuits
--    - Kenney Assets (https://kenney.nl) - modèles gratuits
--
-- 2. Formats supportés: .glb (recommandé) ou .gltf
--
-- 3. Dans Supabase Dashboard > Storage > furniture-models:
--    - Cliquez "Upload files"
--    - Sélectionnez vos fichiers .glb
--
-- 4. L'URL du modèle sera:
--    https://[votre-projet].supabase.co/storage/v1/object/public/furniture-models/[nom-fichier].glb

-- ===============================================
-- ÉTAPE 4: Mettre à jour la table furniture
-- ===============================================
-- Exemple pour ajouter un modèle à un meuble existant:
--
-- UPDATE furniture
-- SET model_url = 'https://[votre-projet].supabase.co/storage/v1/object/public/furniture-models/sofa.glb'
-- WHERE name = 'Canapé 3 places';

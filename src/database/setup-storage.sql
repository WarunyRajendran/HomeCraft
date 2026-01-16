-- ===============================================
-- HomeCraft - Policies Storage pour images de meubles
-- À exécuter dans SQL Editor après avoir créé le bucket manuellement
-- ===============================================

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Public read access for furniture images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload furniture images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update furniture images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete furniture images" ON storage.objects;

-- Policy 1: Lecture publique des images
CREATE POLICY "Public read access for furniture images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'furniture-images');

-- Policy 2: Upload par utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload furniture images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'furniture-images');

-- Policy 3: Modification par utilisateurs authentifiés
CREATE POLICY "Authenticated users can update furniture images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'furniture-images');

-- Policy 4: Suppression par utilisateurs authentifiés
CREATE POLICY "Authenticated users can delete furniture images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'furniture-images');

-- ===============================================
-- HomeCraft - Policies pour permettre aux admins de modifier les données
-- À exécuter dans SQL Editor de Supabase
-- ===============================================

-- ============ TABLE: furniture ============
-- Permettre aux admins de modifier les meubles

CREATE POLICY "Admins can update furniture"
ON furniture
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can insert furniture"
ON furniture
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can delete furniture"
ON furniture
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- ============ TABLE: partners ============
-- Permettre aux admins de modifier les partenaires

CREATE POLICY "Admins can update partners"
ON partners
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can insert partners"
ON partners
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can delete partners"
ON partners
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- ============ TABLE: furniture_categories ============
-- Permettre aux admins de modifier les catégories

CREATE POLICY "Admins can update categories"
ON furniture_categories
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can insert categories"
ON furniture_categories
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can delete categories"
ON furniture_categories
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- ===============================================
-- Créer les profils manquants pour les utilisateurs existants
-- ===============================================

-- Insérer un profil pour chaque utilisateur qui n'en a pas
INSERT INTO public.profiles (user_id, full_name, avatar_url)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', 'Utilisateur'),
  COALESCE(au.raw_user_meta_data->>'avatar_url', '')
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL;

-- Vérifier que tous les utilisateurs ont maintenant un profil
SELECT
  'Total users' AS info,
  COUNT(*) AS count
FROM auth.users
UNION ALL
SELECT
  'Total profiles',
  COUNT(*)
FROM public.profiles;

SELECT '✅ Profils créés avec succès!' AS status;

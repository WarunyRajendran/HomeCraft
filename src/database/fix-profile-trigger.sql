-- ===============================================
-- FIX: Créer automatiquement un profil lors de l'inscription
-- Ce script améliore la gestion d'erreurs
-- ===============================================

-- ÉTAPE 1 : Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ÉTAPE 2 : Supprimer l'ancienne fonction s'il existe
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ÉTAPE 3 : Créer la nouvelle fonction avec gestion d'erreurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insérer le profil
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Logger l'erreur (apparaîtra dans les logs Supabase)
    RAISE WARNING 'Erreur lors de la création du profil pour user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- ÉTAPE 4 : Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ÉTAPE 5 : Donner les permissions nécessaires
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;

-- ÉTAPE 6 : Vérifications
SELECT 'ÉTAPE 1: Vérification du trigger' AS etape;
SELECT
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

SELECT 'ÉTAPE 2: Vérification de la fonction' AS etape;
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

SELECT 'ÉTAPE 3: Trigger configuré avec succès! ✅' AS status;

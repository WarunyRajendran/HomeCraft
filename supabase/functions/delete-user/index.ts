// Supabase Edge Function pour supprimer complètement un utilisateur
// Deploy: supabase functions deploy delete-user

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Récupérer le token d'autorisation
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader)

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token manquant' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Créer un client Supabase avec le token de l'utilisateur
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Extraire le token du header Bearer
    const token = authHeader.replace('Bearer ', '')

    // Client pour vérifier l'utilisateur authentifié
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    })

    // Vérifier l'utilisateur connecté
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    console.log('User check:', user?.id, 'Error:', userError?.message)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Utilisateur non authentifié', details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = user.id

    // Client admin avec service_role pour les opérations privilégiées
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 1. Supprimer les projets de l'utilisateur
    const { error: projectsError } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('user_id', userId)

    if (projectsError) {
      console.error('Erreur suppression projets:', projectsError)
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la suppression des projets' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Supprimer le profil de l'utilisateur
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('user_id', userId)

    if (profileError) {
      console.error('Erreur suppression profil:', profileError)
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la suppression du profil' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Supprimer l'utilisateur de auth.users (nécessite service_role)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Erreur suppression auth user:', authError)
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la suppression du compte' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Compte supprimé avec succès' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur inattendue:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

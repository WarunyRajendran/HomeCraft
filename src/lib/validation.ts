import { z } from 'zod';

// ============================================
// SCHÉMAS DE VALIDATION
// ============================================

// Validation des projets
export const FurniturePlacementSchema = z.object({
  id: z.string(),
  name: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  scale: z.number().positive().min(0.1).max(5),
});

export const RoomDataSchema = z.object({
  backgroundImage: z.string().url().nullable().optional(),
}).nullable();

export const ProjectCreateSchema = z.object({
  user_id: z.string().uuid(),
  name: z.string().min(1).max(100).trim(),
  room_data: RoomDataSchema,
  furniture_placements: z.array(FurniturePlacementSchema).nullable(),
  room_image_url: z.string().url().nullable().optional(),
});

export const ProjectUpdateSchema = ProjectCreateSchema.partial().omit({ user_id: true });

// Validation de la recherche de meubles
export const SearchQuerySchema = z.string()
  .min(1, 'La recherche ne peut pas être vide')
  .max(100, 'La recherche est trop longue')
  .trim()
  .regex(
    /^[a-zA-Z0-9\s\-_éèêëàâäôöùûüïîçÉÈÊËÀÂÄÔÖÙÛÜÏÎÇ]+$/,
    'Caractères invalides dans la recherche'
  );

// Validation des UUIDs
export const UUIDSchema = z.string().uuid('Identifiant invalide');

// Validation des mots de passe
export const PasswordSchema = z.string()
  .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une lettre minuscule')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une lettre majuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
  .regex(/[^a-zA-Z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial');

// ============================================
// SANITIZATION ET SÉCURITÉ
// ============================================

/**
 * Sanitize une URL d'image pour prévenir les attaques XSS
 * @param url - URL à valider
 * @returns URL validée ou null si invalide
 */
export const sanitizeImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;

  // Autoriser les data URLs d'images (base64)
  if (url.startsWith('data:image/')) {
    return url;
  }

  try {
    const parsed = new URL(url);

    // N'autoriser que HTTP/HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      console.warn(`Protocol non autorisé détecté: ${parsed.protocol}`);
      return null;
    }

    // Whitelist de domaines autorisés pour les images
    const allowedDomains = [
      'supabase.co',
      'supabase.in',
      'storage.googleapis.com',
      'cloudinary.com',
      'imgur.com',
      // Ajouter d'autres domaines de confiance si nécessaire
    ];

    const isAllowed = allowedDomains.some(domain =>
      parsed.hostname.endsWith(domain) || parsed.hostname === domain
    );

    if (!isAllowed) {
      console.warn(`Domaine non autorisé détecté: ${parsed.hostname}`);
      return null;
    }

    return url;
  } catch (error) {
    console.warn('URL invalide détectée:', url);
    return null;
  }
};

/**
 * Échappe les caractères spéciaux SQL LIKE pour prévenir les injections
 * @param query - Requête de recherche
 * @returns Requête échappée
 */
export const escapeSQLLike = (query: string): string => {
  return query
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
};

/**
 * Valide et sanitize une requête de recherche
 * @param query - Requête à valider
 * @returns Requête validée et sanitizée
 */
export const validateAndSanitizeSearch = (query: string): string => {
  const validated = SearchQuerySchema.parse(query);
  return escapeSQLLike(validated);
};

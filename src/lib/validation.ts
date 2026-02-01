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
  imageUrl: z.string().nullable().optional(),
  modelUrl: z.string().nullable().optional(),
});

// Accepte soit une URL valide, soit une data URL base64
const ImageUrlSchema = z.string().refine(
  (val) => {
    if (!val) return true;
    // Accepter les data URLs
    if (val.startsWith('data:image/')) return true;
    // Accepter les URLs HTTP/HTTPS
    try {
      const url = new URL(val);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  },
  { message: "Invalid image URL" }
).nullable().optional();

export const RoomDataSchema = z.object({
  backgroundImage: ImageUrlSchema,
}).nullable();

export const ProjectCreateSchema = z.object({
  user_id: z.string().uuid(),
  name: z.string().min(1).max(100).trim(),
  room_data: RoomDataSchema,
  furniture_placements: z.array(FurniturePlacementSchema).nullable(),
  room_image_url: ImageUrlSchema,
});

export const ProjectUpdateSchema = ProjectCreateSchema.partial().omit({ user_id: true });

// Validation de la recherche de meubles
export const SearchQuerySchema = z.string()
  .min(1, 'Search cannot be empty')
  .max(100, 'Search is too long')
  .trim()
  .regex(
    /^[a-zA-Z0-9\s\-_éèêëàâäôöùûüïîçÉÈÊËÀÂÄÔÖÙÛÜÏÎÇ]+$/,
    'Invalid characters in search'
  );

// UUID validation
export const UUIDSchema = z.string().uuid('Invalid identifier');

// Password validation
export const PasswordSchema = z.string()
  .min(12, 'Password must contain at least 12 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

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

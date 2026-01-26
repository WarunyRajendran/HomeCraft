/**
 * Types et interfaces pour le mode hybride 3D sur photo 2D
 */

/**
 * Point 2D normalisé (coordonnées 0-1 relatives à l'image)
 */
export interface Point2D {
  x: number;
  y: number;
}

/**
 * Les 4 coins du sol sur l'image
 * Ordonnés: arrière-gauche, arrière-droit, avant-droit, avant-gauche (sens horaire depuis arrière-gauche)
 */
export type FloorCorners = [Point2D, Point2D, Point2D, Point2D];

/**
 * Paramètres de perspective pour la calibration
 */
export interface PerspectiveSettings {
  /** Champ de vision vertical en degrés (15-90) */
  fov: number;
  /** Hauteur de la caméra en mètres (0.5-3) */
  cameraHeight: number;
  /** Inclinaison de la caméra en degrés (-45 à 45, négatif = regarder vers le bas) */
  cameraTilt: number;
  /** Point de fuite principal (coordonnées normalisées 0-1) */
  vanishingPoint: Point2D;
  /** Position Y de la ligne d'horizon (coordonnée normalisée 0-1, 0=haut, 1=bas) */
  horizonY: number;
  /** Les 4 coins du sol définis sur l'image */
  floorCorners: FloorCorners;
  /** Largeur estimée du sol en mètres */
  floorWidth: number;
  /** Profondeur estimée du sol en mètres */
  floorDepth: number;
}

/**
 * Valeurs par défaut pour les paramètres de perspective
 */
export const DEFAULT_PERSPECTIVE_SETTINGS: PerspectiveSettings = {
  fov: 50,
  cameraHeight: 1.6, // Hauteur des yeux d'une personne debout
  cameraTilt: -15, // Légèrement vers le bas
  vanishingPoint: { x: 0.5, y: 0.4 },
  horizonY: 0.4,
  floorCorners: [
    { x: 0.1, y: 0.4 },  // arrière-gauche
    { x: 0.9, y: 0.4 },  // arrière-droit
    { x: 0.95, y: 0.95 }, // avant-droit
    { x: 0.05, y: 0.95 }, // avant-gauche
  ],
  floorWidth: 4,
  floorDepth: 4,
};

/**
 * État de calibration
 */
export type CalibrationStep =
  | 'idle'           // Pas en cours de calibration
  | 'floor-corners'  // Définition des 4 coins du sol
  | 'perspective';   // Ajustement des paramètres de perspective

/**
 * Données de placement de meuble en mode hybride
 */
export interface HybridFurniturePlacement {
  id: string;
  furnitureId: string;
  name: string;
  /** Position 3D sur le sol (Y = hauteur au-dessus du sol) */
  position: [number, number, number];
  /** Rotation en radians [x, y, z] */
  rotation: [number, number, number];
  /** Échelle [x, y, z] */
  scale: [number, number, number];
  color: string;
  modelUrl: string | null;
  imageUrl: string | null;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
}

/**
 * Utilitaires pour les calculs de perspective en mode hybride
 */

import * as THREE from 'three';
import type { PerspectiveSettings, Point2D, FloorCorners } from '@/types/perspective';

/**
 * Calcule la position et rotation de la caméra à partir des paramètres de perspective
 */
export function calculateCameraFromPerspective(settings: PerspectiveSettings): {
  position: [number, number, number];
  rotation: [number, number, number];
  fov: number;
} {
  const { cameraHeight, cameraTilt, floorDepth } = settings;

  // Convertir l'inclinaison en radians
  const tiltRadians = THREE.MathUtils.degToRad(cameraTilt);

  // Position de la caméra: en arrière et en hauteur par rapport au centre de la scène
  // La distance horizontale dépend de la profondeur du sol et de l'inclinaison
  const horizontalDistance = (floorDepth / 2) + cameraHeight / Math.tan(Math.abs(tiltRadians) || 0.1);

  const position: [number, number, number] = [
    0, // Centré en X
    cameraHeight,
    horizontalDistance,
  ];

  // Rotation: inclinaison en X (regarder vers le bas)
  const rotation: [number, number, number] = [
    tiltRadians,
    0, // Pas de rotation en Y
    0, // Pas de rotation en Z
  ];

  return {
    position,
    rotation,
    fov: settings.fov,
  };
}

/**
 * Calcule la matrice de transformation perspective à partir des 4 coins du sol
 * Utilisé pour mapper les coordonnées 2D de l'image vers les coordonnées 3D du sol
 */
export function calculatePerspectiveMatrix(
  floorCorners: FloorCorners,
  floorWidth: number,
  floorDepth: number
): THREE.Matrix4 | null {
  // Points source (coins du sol dans l'espace 3D)
  const src = [
    new THREE.Vector3(-floorWidth / 2, 0, -floorDepth / 2), // arrière-gauche
    new THREE.Vector3(floorWidth / 2, 0, -floorDepth / 2),  // arrière-droit
    new THREE.Vector3(floorWidth / 2, 0, floorDepth / 2),   // avant-droit
    new THREE.Vector3(-floorWidth / 2, 0, floorDepth / 2),  // avant-gauche
  ];

  // Points destination (coins sur l'image, normalisés en coordonnées 3D)
  const dst = floorCorners.map(corner =>
    new THREE.Vector3(corner.x - 0.5, 0.5 - corner.y, 0)
  );

  // Cette fonction retourne une matrice approximative
  // Pour une transformation perspective exacte, on utiliserait une homographie
  // Ici on utilise une approximation linéaire
  const matrix = new THREE.Matrix4();

  // Calcul du centre et de l'échelle approximatifs
  const srcCenter = new THREE.Vector3().addVectors(src[0], src[2]).multiplyScalar(0.5);
  const dstCenter = new THREE.Vector3().addVectors(dst[0], dst[2]).multiplyScalar(0.5);

  const srcWidth = src[1].x - src[0].x;
  const dstWidth = dst[1].x - dst[0].x;
  const scaleX = dstWidth / srcWidth || 1;

  const srcDepth = src[2].z - src[0].z;
  const dstDepth = dst[2].y - dst[0].y;
  const scaleZ = dstDepth / srcDepth || 1;

  matrix.makeTranslation(-srcCenter.x, -srcCenter.y, -srcCenter.z);
  matrix.premultiply(new THREE.Matrix4().makeScale(scaleX, 1, scaleZ));
  matrix.premultiply(new THREE.Matrix4().makeTranslation(dstCenter.x, dstCenter.y, dstCenter.z));

  return matrix;
}

/**
 * Convertit un point 2D sur l'image (normalisé 0-1) en position 3D sur le plan du sol
 * Utilise le raycasting avec la caméra perspective
 */
export function imagePointToFloor3D(
  imagePoint: Point2D,
  camera: THREE.PerspectiveCamera,
  floorPlane: THREE.Plane
): THREE.Vector3 | null {
  // Convertir les coordonnées normalisées (0-1) en NDC (-1 à 1)
  const ndc = new THREE.Vector2(
    imagePoint.x * 2 - 1,
    -(imagePoint.y * 2 - 1)
  );

  // Créer un rayon depuis la caméra
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(ndc, camera);

  // Trouver l'intersection avec le plan du sol
  const intersection = new THREE.Vector3();
  const result = raycaster.ray.intersectPlane(floorPlane, intersection);

  return result ? intersection : null;
}

/**
 * Convertit une position 3D sur le sol en coordonnées 2D sur l'image (normalisées 0-1)
 */
export function floor3DToImagePoint(
  position3D: THREE.Vector3,
  camera: THREE.PerspectiveCamera,
  _canvasWidth?: number,
  _canvasHeight?: number
): Point2D | null {
  // Projeter le point 3D sur l'écran
  const projected = position3D.clone().project(camera);

  // Vérifier si le point est devant la caméra
  if (projected.z > 1) {
    return null;
  }

  // Convertir NDC (-1 à 1) en coordonnées normalisées (0-1)
  return {
    x: (projected.x + 1) / 2,
    y: (-projected.y + 1) / 2,
  };
}

/**
 * Calcule la position Y (hauteur) d'un meuble basée sur ses dimensions
 * Pour que le meuble soit posé sur le sol
 */
export function calculateFurnitureYPosition(height: number, scale: number = 1): number {
  return (height * scale) / 2;
}

/**
 * Contraint une position 3D aux limites du sol défini
 * Limites généreuses pour permettre le placement sur tout le sol visible
 */
export function clampToFloorBounds(
  position: [number, number, number],
  floorWidth: number,
  floorDepth: number,
  _margin: number = 0.1
): [number, number, number] {
  // Limites larges : le sol s'étend dans toutes les directions
  const widthLimit = floorWidth * 1.5;
  const depthBackLimit = -floorDepth * 1.5;  // Arrière (loin de la caméra)
  const depthFrontLimit = floorDepth * 1.5;   // Avant (proche de la caméra)

  return [
    THREE.MathUtils.clamp(position[0], -widthLimit, widthLimit),
    position[1], // Y non modifié
    THREE.MathUtils.clamp(position[2], depthBackLimit, depthFrontLimit),
  ];
}

/**
 * Interpole entre deux paramètres de perspective pour une transition fluide
 */
export function lerpPerspectiveSettings(
  from: PerspectiveSettings,
  to: PerspectiveSettings,
  t: number
): PerspectiveSettings {
  const lerp = (a: number, b: number) => a + (b - a) * t;
  const lerpPoint = (a: Point2D, b: Point2D): Point2D => ({
    x: lerp(a.x, b.x),
    y: lerp(a.y, b.y),
  });

  return {
    fov: lerp(from.fov, to.fov),
    cameraHeight: lerp(from.cameraHeight, to.cameraHeight),
    cameraTilt: lerp(from.cameraTilt, to.cameraTilt),
    vanishingPoint: lerpPoint(from.vanishingPoint, to.vanishingPoint),
    horizonY: lerp(from.horizonY, to.horizonY),
    floorCorners: [
      lerpPoint(from.floorCorners[0], to.floorCorners[0]),
      lerpPoint(from.floorCorners[1], to.floorCorners[1]),
      lerpPoint(from.floorCorners[2], to.floorCorners[2]),
      lerpPoint(from.floorCorners[3], to.floorCorners[3]),
    ],
    floorWidth: lerp(from.floorWidth, to.floorWidth),
    floorDepth: lerp(from.floorDepth, to.floorDepth),
  };
}

/**
 * Crée un plan 3D du sol à partir des paramètres
 */
export function createFloorPlane(): THREE.Plane {
  return new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
}

/**
 * Estime les paramètres de perspective à partir des 4 coins du sol
 * Algorithme simplifié basé sur les points de fuite
 */
export function estimatePerspectiveFromCorners(
  corners: FloorCorners,
  _imageAspect: number = 4 / 3
): Partial<PerspectiveSettings> {
  // Les lignes de perspective du sol
  const leftLine = getLine(corners[0], corners[3]); // arrière-gauche vers avant-gauche
  const rightLine = getLine(corners[1], corners[2]); // arrière-droit vers avant-droit
  // Point de fuite horizontal (réservé pour amélioration future)
  lineIntersection(leftLine, rightLine);

  // Calculer le point de fuite vertical (intersection des lignes haut/bas)
  const topLine = getLine(corners[0], corners[1]); // arrière-gauche vers arrière-droit
  const bottomLine = getLine(corners[3], corners[2]); // avant-gauche vers avant-droit

  const vanishingPointV = lineIntersection(topLine, bottomLine);

  // Utiliser le point de fuite vertical pour la ligne d'horizon
  const horizonY = vanishingPointV?.y ?? 0.4;

  // Estimer le FOV basé sur la distorsion perspective
  const avgBackWidth = Math.abs(corners[1].x - corners[0].x);
  const avgFrontWidth = Math.abs(corners[2].x - corners[3].x);
  const perspectiveRatio = avgFrontWidth / avgBackWidth;

  // Plus le ratio est grand, plus le FOV est large
  const estimatedFov = 30 + Math.min(40, (perspectiveRatio - 1) * 60);

  return {
    fov: Math.round(estimatedFov),
    horizonY: THREE.MathUtils.clamp(horizonY, 0.2, 0.8),
    vanishingPoint: vanishingPointV ?? { x: 0.5, y: 0.4 },
    cameraTilt: Math.round((0.5 - horizonY) * 60), // Estimation de l'inclinaison
  };
}

// Fonctions utilitaires pour les calculs géométriques

interface Line2D {
  a: number;
  b: number;
  c: number; // ax + by + c = 0
}

function getLine(p1: Point2D, p2: Point2D): Line2D {
  const a = p2.y - p1.y;
  const b = p1.x - p2.x;
  const c = -(a * p1.x + b * p1.y);
  return { a, b, c };
}

function lineIntersection(l1: Line2D, l2: Line2D): Point2D | null {
  const det = l1.a * l2.b - l2.a * l1.b;
  if (Math.abs(det) < 0.0001) {
    return null; // Lignes parallèles
  }

  const x = (l1.b * l2.c - l2.b * l1.c) / det;
  const y = (l2.a * l1.c - l1.a * l2.c) / det;

  return { x, y };
}

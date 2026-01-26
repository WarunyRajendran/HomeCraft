/**
 * FloorPlaneConfigurator - Interface pour définir les 4 coins du sol sur l'image
 * Permet à l'utilisateur de cliquer/glisser les marqueurs pour calibrer la perspective
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '../ui/button';
import { Check, RotateCcw } from 'lucide-react';
import type { FloorCorners, Point2D } from '@/types/perspective';
import { DEFAULT_PERSPECTIVE_SETTINGS } from '@/types/perspective';

interface FloorPlaneConfiguratorProps {
  floorCorners: FloorCorners;
  onCornersChange: (corners: FloorCorners) => void;
  onComplete: () => void;
}

const CORNER_LABELS = [
  'Arrière gauche',
  'Arrière droit',
  'Avant droit',
  'Avant gauche',
];

const CORNER_COLORS = [
  '#ef4444', // rouge
  '#22c55e', // vert
  '#3b82f6', // bleu
  '#f59e0b', // orange
];

export const FloorPlaneConfigurator = ({
  floorCorners,
  onCornersChange,
  onComplete,
}: FloorPlaneConfiguratorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedCorner, setDraggedCorner] = useState<number | null>(null);
  const [hoveredCorner, setHoveredCorner] = useState<number | null>(null);

  // Convertir les coordonnées de la souris en coordonnées normalisées (0-1)
  const getRelativePosition = useCallback(
    (clientX: number, clientY: number): Point2D | null => {
      if (!containerRef.current) return null;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;

      // Contraindre aux limites
      return {
        x: Math.max(0.02, Math.min(0.98, x)),
        y: Math.max(0.02, Math.min(0.98, y)),
      };
    },
    []
  );

  // Gérer le drag des marqueurs
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedCorner === null) return;

      const pos = getRelativePosition(e.clientX, e.clientY);
      if (!pos) return;

      const newCorners = [...floorCorners] as FloorCorners;
      newCorners[draggedCorner] = pos;
      onCornersChange(newCorners);
    };

    const handleMouseUp = () => {
      setDraggedCorner(null);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (draggedCorner === null || !e.touches[0]) return;
      e.preventDefault();

      const pos = getRelativePosition(e.touches[0].clientX, e.touches[0].clientY);
      if (!pos) return;

      const newCorners = [...floorCorners] as FloorCorners;
      newCorners[draggedCorner] = pos;
      onCornersChange(newCorners);
    };

    const handleTouchEnd = () => {
      setDraggedCorner(null);
    };

    if (draggedCorner !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [draggedCorner, floorCorners, onCornersChange, getRelativePosition]);

  const handleCornerMouseDown = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setDraggedCorner(index);
  };

  const handleCornerTouchStart = (index: number) => (e: React.TouchEvent) => {
    e.preventDefault();
    setDraggedCorner(index);
  };

  const handleReset = () => {
    onCornersChange(DEFAULT_PERSPECTIVE_SETTINGS.floorCorners);
  };

  // Générer le chemin SVG du polygone
  const polygonPath = floorCorners
    .map((corner, i) => {
      const x = corner.x * 100;
      const y = corner.y * 100;
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ') + ' Z';

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 cursor-crosshair"
      style={{ touchAction: 'none' }}
    >
      {/* Overlay SVG pour dessiner le polygone et les marqueurs */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Fond semi-transparent hors du polygone */}
        <defs>
          <mask id="floor-mask">
            <rect width="100%" height="100%" fill="white" />
            <path d={polygonPath} fill="black" />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.4)"
          mask="url(#floor-mask)"
        />

        {/* Polygone du sol */}
        <path
          d={polygonPath}
          fill="rgba(184, 134, 11, 0.15)"
          stroke="#b8860b"
          strokeWidth="2"
          strokeDasharray="8 4"
        />

        {/* Lignes de connexion entre les coins */}
        {floorCorners.map((corner, i) => {
          const nextCorner = floorCorners[(i + 1) % 4];
          return (
            <line
              key={`line-${i}`}
              x1={`${corner.x * 100}%`}
              y1={`${corner.y * 100}%`}
              x2={`${nextCorner.x * 100}%`}
              y2={`${nextCorner.y * 100}%`}
              stroke={CORNER_COLORS[i]}
              strokeWidth="2"
              opacity="0.6"
            />
          );
        })}

        {/* Lignes de perspective (diagonales) */}
        <line
          x1={`${floorCorners[0].x * 100}%`}
          y1={`${floorCorners[0].y * 100}%`}
          x2={`${floorCorners[2].x * 100}%`}
          y2={`${floorCorners[2].y * 100}%`}
          stroke="white"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.5"
        />
        <line
          x1={`${floorCorners[1].x * 100}%`}
          y1={`${floorCorners[1].y * 100}%`}
          x2={`${floorCorners[3].x * 100}%`}
          y2={`${floorCorners[3].y * 100}%`}
          stroke="white"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.5"
        />
      </svg>

      {/* Marqueurs draggables pour chaque coin */}
      {floorCorners.map((corner, index) => (
        <div
          key={index}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          style={{
            left: `${corner.x * 100}%`,
            top: `${corner.y * 100}%`,
          }}
        >
          {/* Marqueur principal */}
          <div
            className={`
              w-6 h-6 rounded-full border-2 cursor-grab active:cursor-grabbing
              flex items-center justify-center text-xs font-bold text-white
              transition-transform duration-150
              ${draggedCorner === index ? 'scale-125' : ''}
              ${hoveredCorner === index ? 'scale-110' : ''}
            `}
            style={{
              backgroundColor: CORNER_COLORS[index],
              borderColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
            onMouseDown={handleCornerMouseDown(index)}
            onTouchStart={handleCornerTouchStart(index)}
            onMouseEnter={() => setHoveredCorner(index)}
            onMouseLeave={() => setHoveredCorner(null)}
          >
            {index + 1}
          </div>

          {/* Label du coin */}
          <div
            className={`
              absolute whitespace-nowrap text-xs px-2 py-1 rounded bg-black/80 text-white
              transform transition-opacity duration-150
              ${hoveredCorner === index || draggedCorner === index ? 'opacity-100' : 'opacity-0'}
            `}
            style={{
              left: index < 2 ? '100%' : 'auto',
              right: index >= 2 ? '100%' : 'auto',
              top: '50%',
              transform: 'translateY(-50%)',
              marginLeft: index < 2 ? '8px' : '0',
              marginRight: index >= 2 ? '8px' : '0',
            }}
          >
            {CORNER_LABELS[index]}
          </div>
        </div>
      ))}

      {/* Boutons de contrôle */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="bg-white/90 hover:bg-white"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Réinitialiser
        </Button>
        <Button
          size="sm"
          onClick={onComplete}
          className="gradient-gold text-accent-foreground"
        >
          <Check className="h-4 w-4 mr-1" />
          Valider
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm max-w-md text-center">
        Faites glisser les marqueurs pour délimiter le sol de la pièce.
        <br />
        <span className="text-xs text-white/70">
          Commencez par l'arrière-gauche et suivez le sens horaire.
        </span>
      </div>
    </div>
  );
};

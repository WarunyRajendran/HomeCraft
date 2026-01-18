import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Search, Plus, Sofa, Bed, Table2, Lamp, BookOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useFurnitureByCategory, useFurnitureSearch } from "@/hooks/useFurniture";
import { useCategories } from "@/hooks/useCategories";

interface FurnitureCatalogProps {
  onAddFurniture: (furniture: {
    id: string;
    name: string;
    color: string;
    imageUrl: string | null;
    dimensions: { width: number; height: number; depth: number };
  }) => void;
}

export const FurnitureCatalog = ({ onAddFurniture }: FurnitureCatalogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [tappedItemId, setTappedItemId] = useState<string | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Fetch data from database
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: furniture, isLoading: furnitureLoading, error } = useFurnitureByCategory(selectedCategoryId);
  const { data: searchResults } = useFurnitureSearch(searchQuery);

  // Use search results if searching, otherwise use filtered furniture
  const displayFurniture = searchQuery ? searchResults : furniture;

  // Map database icons to Lucide icons
  const getCategoryIcon = (iconName: string): LucideIcon => {
    const iconMap: Record<string, LucideIcon> = {
      'sofa': Sofa,
      'bed': Bed,
      'desk': Table2,
      'utensils': Table2,
      'archive': BookOpen,
      'lamp': Lamp,
    };
    return iconMap[iconName] || Sofa;
  };

  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4">
        <p className="text-destructive">Erreur de chargement</p>
        <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background md:border-l border-border overflow-hidden">
      <div className="p-2 md:p-4 border-b border-border shrink-0">
        <h2 className="text-base md:text-lg font-semibold text-foreground mb-2 md:mb-3">Catalogue</h2>

        {/* Search */}
        <div className="relative mb-2 md:mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          <Badge
            variant={selectedCategoryId === null ? "default" : "outline"}
            className="cursor-pointer text-xs py-0.5 px-2"
            onClick={() => setSelectedCategoryId(null)}
          >
            Tous
          </Badge>
          {categoriesLoading ? (
            <Badge variant="outline" className="text-xs py-0.5 px-2">Chargement...</Badge>
          ) : (
            categories?.map(category => (
              <Badge
                key={category.id}
                variant={selectedCategoryId === category.id ? "default" : "outline"}
                className="cursor-pointer text-xs py-0.5 px-2"
                onClick={() => setSelectedCategoryId(category.id)}
              >
                {category.name}
              </Badge>
            ))
          )}
        </div>
      </div>

      {/* Furniture list */}
      <div className="flex-1 p-2 md:p-4 pb-20 overflow-y-auto overscroll-contain touch-pan-y">
        {furnitureLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : displayFurniture && displayFurniture.length > 0 ? (
          <div className="grid gap-2 md:gap-3">
            {displayFurniture.map(item => {
              const Icon = getCategoryIcon(item.furniture_categories?.icon || 'sofa');
              const handleAddItem = () => {
                onAddFurniture({
                  id: item.id,
                  name: item.name,
                  color: item.color || '#6B7280',
                  imageUrl: item.image_url,
                  dimensions: {
                    width: item.width ?? 1,
                    height: item.height ?? 1,
                    depth: item.depth ?? 1
                  }
                });
              };

              const isTapped = tappedItemId === item.id;

              return (
                <Card
                  key={item.id}
                  className={`cursor-pointer hover:border-primary/50 transition-all duration-150 group select-none ${
                    isTapped ? 'border-primary bg-primary/10 scale-[0.98]' : ''
                  }`}
                  onClick={handleAddItem}
                  onTouchStart={(e) => {
                    touchStartY.current = e.touches[0].clientY;
                  }}
                  onTouchEnd={(e) => {
                    if (touchStartY.current !== null) {
                      const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
                      // Si le mouvement vertical est < 30px, c'est un tap
                      if (deltaY < 30) {
                        e.preventDefault();
                        // Montrer le feedback visuel
                        setTappedItemId(item.id);
                        setTimeout(() => setTappedItemId(null), 150);
                        handleAddItem();
                      }
                    }
                    touchStartY.current = null;
                  }}
                >
                  <CardContent className="p-2 md:p-3 flex items-center gap-2 md:gap-3">
                    <div
                      className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: (item.color || '#6B7280') + '20' }}
                    >
                      <Icon className="h-5 w-5 md:h-6 md:w-6" style={{ color: item.color || '#6B7280' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs md:text-sm text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground hidden md:block">
                        {item.width}m × {item.depth}m × {item.height}m
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 md:mt-1">
                        <span className="text-xs text-primary font-semibold">
                          {item.price}€
                        </span>
                        {item.partners && (
                          <span className="text-xs text-muted-foreground truncate">
                            {item.partners.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0 pointer-events-none md:pointer-events-auto"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground text-sm">Aucun meuble trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

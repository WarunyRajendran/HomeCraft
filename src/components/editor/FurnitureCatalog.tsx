import { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Search, Plus, Sofa, Bed, Table2, Armchair, Lamp, BookOpen } from "lucide-react";

// Sample furniture data (will be replaced by database data)
const sampleFurniture = [
  { id: "1", name: "Canapé moderne", category: "Salon", color: "#8B4513", dimensions: { width: 2, height: 0.8, depth: 0.9 }, icon: Sofa },
  { id: "2", name: "Table basse", category: "Salon", color: "#654321", dimensions: { width: 1.2, height: 0.45, depth: 0.6 }, icon: Table2 },
  { id: "3", name: "Fauteuil", category: "Salon", color: "#A0522D", dimensions: { width: 0.9, height: 0.85, depth: 0.85 }, icon: Armchair },
  { id: "4", name: "Lit double", category: "Chambre", color: "#DEB887", dimensions: { width: 1.6, height: 0.5, depth: 2 }, icon: Bed },
  { id: "5", name: "Table de chevet", category: "Chambre", color: "#D2691E", dimensions: { width: 0.5, height: 0.55, depth: 0.4 }, icon: Table2 },
  { id: "6", name: "Lampadaire", category: "Éclairage", color: "#2F4F4F", dimensions: { width: 0.3, height: 1.6, depth: 0.3 }, icon: Lamp },
  { id: "7", name: "Bibliothèque", category: "Rangement", color: "#8B7355", dimensions: { width: 1.2, height: 2, depth: 0.35 }, icon: BookOpen },
  { id: "8", name: "Table à manger", category: "Salle à manger", color: "#5D4037", dimensions: { width: 1.8, height: 0.75, depth: 0.9 }, icon: Table2 },
];

interface FurnitureCatalogProps {
  onAddFurniture: (furniture: typeof sampleFurniture[0]) => void;
}

export const FurnitureCatalog = ({ onAddFurniture }: FurnitureCatalogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(sampleFurniture.map(f => f.category))];

  const filteredFurniture = sampleFurniture.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full bg-background border-l border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3">Catalogue de meubles</h2>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            Tous
          </Badge>
          {categories.map(category => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Furniture list */}
      <ScrollArea className="flex-1 p-4">
        <div className="grid gap-3">
          {filteredFurniture.map(item => {
            const Icon = item.icon;
            return (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:border-primary/50 transition-colors group"
                onClick={() => onAddFurniture(item)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: item.color + "20" }}
                  >
                    <Icon className="h-6 w-6" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.dimensions.width}m × {item.dimensions.depth}m × {item.dimensions.height}m
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

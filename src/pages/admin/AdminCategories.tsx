import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderTree, Sofa, Bed, Table2, Lamp, BookOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  created_at: string;
  furniture_count?: number;
}

const AdminCategories = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      // Récupérer les catégories avec le nombre de meubles
      const { data: cats, error: catsError } = await supabase
        .from('furniture_categories')
        .select('*')
        .order('name');

      if (catsError) throw catsError;

      // Récupérer le compte de meubles par catégorie
      const { data: counts, error: countsError } = await supabase
        .from('furniture')
        .select('category_id');

      if (countsError) throw countsError;

      // Compter les meubles par catégorie
      const countMap: Record<string, number> = {};
      counts?.forEach((item) => {
        if (item.category_id) {
          countMap[item.category_id] = (countMap[item.category_id] || 0) + 1;
        }
      });

      return cats?.map((cat) => ({
        ...cat,
        furniture_count: countMap[cat.id] || 0,
      })) as Category[];
    },
  });

  // Map des icônes
  const getIcon = (iconName: string | null): LucideIcon => {
    const iconMap: Record<string, LucideIcon> = {
      'sofa': Sofa,
      'bed': Bed,
      'desk': Table2,
      'utensils': Table2,
      'archive': BookOpen,
      'lamp': Lamp,
    };
    return iconMap[iconName || ''] || FolderTree;
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Categories</h1>
        <p className="text-muted-foreground">Available furniture categories</p>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-6">
        <Badge variant="outline" className="text-sm">
          {categories?.length ?? 0} categories
        </Badge>
        <Badge variant="default" className="text-sm">
          {categories?.reduce((acc, cat) => acc + (cat.furniture_count || 0), 0) ?? 0} total furniture
        </Badge>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-muted rounded-lg mb-4"></div>
                <div className="h-5 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories?.map((category) => {
            const Icon = getIcon(category.icon);
            return (
              <Card key={category.id}>
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>

                  <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Slug: {category.slug}
                  </p>

                  <Badge variant="secondary">
                    {category.furniture_count} item{category.furniture_count !== 1 ? 's' : ''}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {categories?.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <FolderTree className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No categories</p>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;

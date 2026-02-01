import { Card, CardContent } from '@/components/ui/card';
import { Sofa, Building2, FolderTree, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  // Récupérer les statistiques
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [furnitureRes, partnersRes, categoriesRes, projectsRes] = await Promise.all([
        supabase.from('furniture').select('id', { count: 'exact', head: true }),
        supabase.from('partners').select('id', { count: 'exact', head: true }),
        supabase.from('furniture_categories').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
      ]);

      return {
        furniture: furnitureRes.count ?? 0,
        partners: partnersRes.count ?? 0,
        categories: categoriesRes.count ?? 0,
        projects: projectsRes.count ?? 0,
      };
    },
  });

  const statCards = [
    { label: 'Furniture', value: stats?.furniture ?? 0, icon: Sofa, color: 'text-blue-500' },
    { label: 'Partners', value: stats?.partners ?? 0, icon: Building2, color: 'text-green-500' },
    { label: 'Categories', value: stats?.categories ?? 0, icon: FolderTree, color: 'text-purple-500' },
    { label: 'User projects', value: stats?.projects ?? 0, icon: Users, color: 'text-orange-500' },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Application overview</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-muted rounded-lg mb-4"></div>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className={`h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

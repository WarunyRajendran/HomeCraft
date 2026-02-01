import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Partner {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
  created_at: string;
}

const AdminPartners = () => {
  const { data: partners, isLoading } = useQuery({
    queryKey: ['admin-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Partner[];
    },
  });

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Partners</h1>
        <p className="text-muted-foreground">List of furniture supplier partners</p>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-6">
        <Badge variant="outline" className="text-sm">
          {partners?.length ?? 0} partners
        </Badge>
        <Badge variant="default" className="text-sm">
          <CheckCircle className="h-3 w-3 mr-1" />
          {partners?.filter(p => p.is_active).length ?? 0} active
        </Badge>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-muted rounded-lg mb-4"></div>
                <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners?.map((partner) => (
            <Card key={partner.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {partner.logo_url ? (
                      <img
                        src={partner.logo_url}
                        alt={partner.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  {partner.is_active ? (
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </Badge>
                  )}
                </div>

                <h3 className="font-semibold text-foreground mb-1">{partner.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {partner.description || 'No description'}
                </p>

                {partner.website_url && (
                  <a
                    href={partner.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Visit website
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {partners?.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No partners</p>
        </div>
      )}
    </div>
  );
};

export default AdminPartners;

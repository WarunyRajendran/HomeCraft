import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Upload, ImageIcon, X, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Furniture {
  id: string;
  name: string;
  color: string | null;
  image_url: string | null;
  price: number | null;
  width: number | null;
  height: number | null;
  depth: number | null;
  furniture_categories: { name: string } | null;
  partners: { name: string } | null;
}

const AdminFurniture = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Récupérer tous les meubles
  const { data: furniture, isLoading } = useQuery({
    queryKey: ['admin-furniture'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('furniture')
        .select(`
          id,
          name,
          color,
          image_url,
          price,
          width,
          height,
          depth,
          furniture_categories(name),
          partners(name)
        `)
        .order('name');

      if (error) throw error;
      return data as Furniture[];
    },
  });

  // Mutation pour uploader l'image
  const uploadImage = useMutation({
    mutationFn: async ({ furnitureId, file, oldImageUrl }: { furnitureId: string; file: File; oldImageUrl: string | null }) => {
      // Supprimer l'ancienne image si elle existe
      if (oldImageUrl) {
        const oldPath = oldImageUrl.split('/furniture-images/')[1];
        if (oldPath) {
          await supabase.storage.from('furniture-images').remove([oldPath]);
        }
      }

      // Nom de fichier fixe basé sur l'ID du meuble
      const fileExt = file.name.split('.').pop();
      const fileName = `furniture/${furnitureId}.${fileExt}`;

      // Upload dans Supabase Storage (upsert pour écraser si même nom)
      const { error: uploadError } = await supabase.storage
        .from('furniture-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Récupérer l'URL publique (ajouter timestamp pour éviter le cache)
      const { data: urlData } = supabase.storage
        .from('furniture-images')
        .getPublicUrl(fileName);

      const imageUrlWithCacheBust = `${urlData.publicUrl}?t=${Date.now()}`;

      // Mettre à jour la table furniture
      const { error: updateError } = await supabase
        .from('furniture')
        .update({ image_url: imageUrlWithCacheBust })
        .eq('id', furnitureId);

      if (updateError) throw updateError;

      return imageUrlWithCacheBust;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-furniture'] });
      toast.success('Image mise à jour');
      setUploadingId(null);
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error('Erreur lors de l\'upload');
      setUploadingId(null);
    },
  });

  // Mutation pour supprimer l'image
  const removeImage = useMutation({
    mutationFn: async (furnitureId: string) => {
      const { error } = await supabase
        .from('furniture')
        .update({ image_url: null })
        .eq('id', furnitureId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-furniture'] });
      toast.success('Image supprimée');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const selectedFurnitureRef = useRef<{ furnitureId: string; oldImageUrl: string | null } | null>(null);

  const handleFileSelect = (furnitureId: string, oldImageUrl: string | null) => {
    setUploadingId(furnitureId);
    // Stocker l'ancienne URL pour la suppression
    selectedFurnitureRef.current = { furnitureId, oldImageUrl };
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedFurnitureRef.current) {
      uploadImage.mutate({
        furnitureId: selectedFurnitureRef.current.furnitureId,
        file,
        oldImageUrl: selectedFurnitureRef.current.oldImageUrl,
      });
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Filtrer les meubles
  const filteredFurniture = furniture?.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.partners?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.furniture_categories?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Gestion des Meubles</h1>
        <p className="text-muted-foreground">Ajoutez des images aux meubles du catalogue</p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un meuble..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-6">
        <Badge variant="outline" className="text-sm">
          {furniture?.length ?? 0} meubles au total
        </Badge>
        <Badge variant="default" className="text-sm">
          <Check className="h-3 w-3 mr-1" />
          {furniture?.filter(f => f.image_url).length ?? 0} avec image
        </Badge>
        <Badge variant="secondary" className="text-sm">
          <ImageIcon className="h-3 w-3 mr-1" />
          {furniture?.filter(f => !f.image_url).length ?? 0} sans image
        </Badge>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Furniture grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-40 bg-muted"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFurniture?.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              {/* Image area */}
              <div className="relative h-40 bg-muted flex items-center justify-center">
                {item.image_url ? (
                  <>
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-contain p-2"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => removeImage.mutate(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div className="text-center">
                    <div
                      className="w-16 h-16 rounded-lg mx-auto mb-2 flex items-center justify-center"
                      style={{ backgroundColor: (item.color || '#6B7280') + '30' }}
                    >
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">Pas d'image</p>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <h3 className="font-medium text-foreground truncate mb-1">{item.name}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  {item.furniture_categories?.name && (
                    <Badge variant="outline" className="text-xs">
                      {item.furniture_categories.name}
                    </Badge>
                  )}
                  {item.partners?.name && (
                    <span className="truncate">{item.partners.name}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  {item.price && <span>{item.price}€</span>}
                  {item.width && item.depth && item.height && (
                    <span>• {item.width}×{item.depth}×{item.height}m</span>
                  )}
                </div>
                <Button
                  variant={item.image_url ? 'outline' : 'default'}
                  size="sm"
                  className="w-full"
                  onClick={() => handleFileSelect(item.id, item.image_url)}
                  disabled={uploadImage.isPending && uploadingId === item.id}
                >
                  {uploadImage.isPending && uploadingId === item.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Upload...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {item.image_url ? 'Changer l\'image' : 'Ajouter une image'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredFurniture?.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun meuble trouvé</p>
        </div>
      )}
    </div>
  );
};

export default AdminFurniture;

import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Upload, X, Check, Box } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Furniture {
  id: string;
  name: string;
  color: string | null;
  model_url: string | null;
  price: number | null;
  width: number | null;
  height: number | null;
  depth: number | null;
  furniture_categories: { name: string } | null;
  partners: { name: string } | null;
}

const AdminFurniture = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingModelId, setUploadingModelId] = useState<string | null>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);
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
          model_url,
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

  // Mutation pour uploader le modèle 3D
  const uploadModel = useMutation({
    mutationFn: async ({ furnitureId, file, oldModelUrl }: { furnitureId: string; file: File; oldModelUrl: string | null }) => {
      // Supprimer l'ancien modèle si il existe
      if (oldModelUrl) {
        const oldPath = oldModelUrl.split('/furniture-models/')[1]?.split('?')[0];
        if (oldPath) {
          await supabase.storage.from('furniture-models').remove([oldPath]);
        }
      }

      // Nom de fichier fixe basé sur l'ID du meuble
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${furnitureId}.${fileExt}`;

      // Upload dans Supabase Storage (upsert pour écraser si même nom)
      const { error: uploadError } = await supabase.storage
        .from('furniture-models')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Récupérer l'URL publique (ajouter timestamp pour éviter le cache)
      const { data: urlData } = supabase.storage
        .from('furniture-models')
        .getPublicUrl(fileName);

      const modelUrlWithCacheBust = `${urlData.publicUrl}?t=${Date.now()}`;

      // Mettre à jour la table furniture
      const { error: updateError } = await supabase
        .from('furniture')
        .update({ model_url: modelUrlWithCacheBust })
        .eq('id', furnitureId);

      if (updateError) throw updateError;

      return modelUrlWithCacheBust;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-furniture'] });
      toast.success('Modèle 3D mis à jour');
      setUploadingModelId(null);
    },
    onError: (error) => {
      console.error('Upload model error:', error);
      toast.error('Erreur lors de l\'upload du modèle 3D');
      setUploadingModelId(null);
    },
  });

  // Mutation pour supprimer le modèle 3D
  const removeModel = useMutation({
    mutationFn: async (furnitureId: string) => {
      const { error } = await supabase
        .from('furniture')
        .update({ model_url: null })
        .eq('id', furnitureId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-furniture'] });
      toast.success('Modèle 3D supprimé');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const selectedModelRef = useRef<{ furnitureId: string; oldModelUrl: string | null } | null>(null);

  const handleModelSelect = (furnitureId: string, oldModelUrl: string | null) => {
    setUploadingModelId(furnitureId);
    selectedModelRef.current = { furnitureId, oldModelUrl };
    modelInputRef.current?.click();
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const allowedExtensions = ['.glb', '.gltf'];
    const fileExt = file?.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (file && !allowedExtensions.includes(fileExt || '')) {
      toast.error('Format non supporté. Utilisez GLB ou GLTF.');
      setUploadingModelId(null);
      return;
    }

    if (file && selectedModelRef.current) {
      uploadModel.mutate({
        furnitureId: selectedModelRef.current.furnitureId,
        file,
        oldModelUrl: selectedModelRef.current.oldModelUrl,
      });
    }
    // Reset input
    if (modelInputRef.current) {
      modelInputRef.current.value = '';
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
        <p className="text-muted-foreground">Ajoutez des modèles 3D aux meubles du catalogue</p>
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
      <div className="flex flex-wrap gap-4 mb-6">
        <Badge variant="outline" className="text-sm">
          {furniture?.length ?? 0} meubles au total
        </Badge>
        <Badge variant="default" className="text-sm bg-purple-600">
          <Check className="h-3 w-3 mr-1" />
          {furniture?.filter(f => f.model_url).length ?? 0} avec modèle 3D
        </Badge>
        <Badge variant="secondary" className="text-sm">
          <Box className="h-3 w-3 mr-1" />
          {furniture?.filter(f => !f.model_url).length ?? 0} sans modèle 3D
        </Badge>
      </div>

      {/* Hidden file input for 3D models */}
      <input
        ref={modelInputRef}
        type="file"
        accept=".glb,.gltf"
        className="hidden"
        onChange={handleModelChange}
      />

      {/* Furniture grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-32 bg-muted"></div>
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
              {/* Color preview area */}
              <div className="relative h-32 bg-muted flex items-center justify-center">
                <div
                  className="w-20 h-20 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: (item.color || '#6B7280') + '40' }}
                >
                  <Box
                    className="h-10 w-10"
                    style={{ color: item.color || '#6B7280' }}
                  />
                </div>
                {/* 3D Model indicator */}
                {item.model_url && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-purple-600 text-white text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      3D
                    </Badge>
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

                {/* 3D Model Button */}
                <div className="flex gap-2">
                  <Button
                    variant={item.model_url ? 'outline' : 'default'}
                    size="sm"
                    className={`flex-1 ${!item.model_url ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}`}
                    onClick={() => handleModelSelect(item.id, item.model_url)}
                    disabled={uploadModel.isPending && uploadingModelId === item.id}
                  >
                    {uploadModel.isPending && uploadingModelId === item.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Upload...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {item.model_url ? 'Changer le modèle 3D' : 'Ajouter modèle 3D'}
                      </>
                    )}
                  </Button>
                  {item.model_url && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeModel.mutate(item.id)}
                      disabled={removeModel.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredFurniture?.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Box className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun meuble trouvé</p>
        </div>
      )}
    </div>
  );
};

export default AdminFurniture;

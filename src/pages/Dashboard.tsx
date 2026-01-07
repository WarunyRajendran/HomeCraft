import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
// import { supabase } from "../integrations/supabase/client";
import { Box, LogOut, Plus, Camera } from "lucide-react";
import { toast } from "sonner";
// import type { User } from "@supabase/supabase-js";

const Dashboard = () => {
  const navigate = useNavigate();
  // const [user, setUser] = useState<User | null>(null);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // setUser(session?.user ?? null);
  //     setLoading(false);
  //     if (!session) {
  //       navigate("/auth");
  //     }
  //   });

  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     setUser(session?.user ?? null);
  //     setLoading(false);
  //     if (!session) {
  //       navigate("/auth");
  //     }
  //   });

  //   return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    // await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-background">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl gradient-gold flex items-center justify-center">
                <Box className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">RoomViz</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {/* {user?.email} */}

              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            {/* Bienvenue, {user?.user_metadata?.full_name || "Utilisateur"} 👋 */}
          </h1>
          <p className="text-muted-foreground">
            Créez un nouveau projet ou continuez à travailler sur vos designs.
          </p>
        </div>

        {/* Empty state */}
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Camera className="w-10 h-10 text-accent" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-card-foreground mb-3">
            Aucun projet pour le moment
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Commencez par prendre une photo de votre pièce pour créer votre premier projet de design d'intérieur.
          </p>
          <Button className="gradient-gold text-accent-foreground hover:opacity-90 shadow-gold px-8">
            <Plus className="w-4 h-4 mr-2" />
            Créer un projet
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
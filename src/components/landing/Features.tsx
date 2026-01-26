import { Camera, Box, Store, Palette, Save, Share2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";

const features = [
  {
    icon: Camera,
    title: "Capturez votre espace",
    description: "Prenez simplement une photo de votre pièce avec votre smartphone pour commencer.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Box,
    title: "Vue 3D immersive",
    description: "Visualisez vos meubles dans une vue 3D réaliste avec rotation complète.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Store,
    title: "Grandes enseignes",
    description: "Accédez au catalogue de partenaires comme IKEA, Conforama, But et plus encore.",
    color: "text-sage",
    bgColor: "bg-sage/10",
  },
  {
    icon: Palette,
    title: "Personnalisez",
    description: "Changez les couleurs, redimensionnez et positionnez chaque meuble librement.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Save,
    title: "Sauvegardez vos projets",
    description: "Créez un compte pour sauvegarder tous vos projets et y accéder partout.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Share2,
    title: "Partagez",
    description: "Exportez et partagez vos créations avec vos proches ou professionnels.",
    color: "text-sage",
    bgColor: "bg-sage/10",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-16 sm:py-24 gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-accent/10 text-accent text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            Fonctionnalités
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            Tout pour imaginer votre
            <span className="text-gradient-gold"> intérieur parfait</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-2">
            Des outils puissants et intuitifs pour transformer votre vision en réalité.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="group bg-card hover:shadow-elegant transition-all duration-500 border-border/50 overflow-hidden opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <CardContent className="p-5 sm:p-8">
                <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${feature.bgColor} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-5 h-5 sm:w-7 sm:h-7 ${feature.color}`} />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-semibold text-card-foreground mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
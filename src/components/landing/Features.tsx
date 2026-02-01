import { Camera, Box, Store, Palette, Save, Share2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";

const features = [
  {
    icon: Camera,
    title: "Capture your space",
    description: "Simply take a photo of your room with your smartphone to get started.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Box,
    title: "Immersive 3D view",
    description: "Visualize your furniture in a realistic 3D view with full rotation.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Store,
    title: "Top brands",
    description: "Access catalogs from partners like IKEA, Conforama, But and more.",
    color: "text-sage",
    bgColor: "bg-sage/10",
  },
  {
    icon: Palette,
    title: "Customize",
    description: "Change colors, resize and position each piece of furniture freely.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Save,
    title: "Save your projects",
    description: "Create an account to save all your projects and access them anywhere.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Share2,
    title: "Share",
    description: "Export and share your designs with friends, family or professionals.",
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
            Features
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            Everything to imagine your
            <span className="text-gradient-gold"> perfect interior</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-2">
            Powerful and intuitive tools to turn your vision into reality.
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

import { Button } from "../ui/button";
import { Camera, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-sage/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] md:w-[800px] h-[400px] sm:h-[600px] md:h-[800px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />

      <div className="relative z-10 container mx-auto px-4 py-16 sm:py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-accent/20 border border-accent/30 mb-6 sm:mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
          <span className="text-xs sm:text-sm font-medium text-primary-foreground/90">Visualisez votre intérieur en 3D</span>
        </div>

        {/* Main heading */}
        <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-4 sm:mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          Imaginez votre
          <span className="block mt-1 sm:mt-2">
            <span className="text-gradient-gold">espace idéal</span>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8 sm:mb-10 px-2 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          Prenez une photo de votre pièce et placez virtuellement des meubles de grandes enseignes pour créer l'intérieur de vos rêves.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center opacity-0 animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
          <Button asChild size="lg" className="gradient-gold text-accent-foreground hover:opacity-90 shadow-gold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold group w-full sm:w-auto">
            <Link to="/auth">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Commencer maintenant
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto">
            <a href="#features">Découvrir les fonctionnalités</a>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-xl mx-auto mt-12 sm:mt-16 opacity-0 animate-fade-in" style={{ animationDelay: "1s" }}>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-accent">500+</p>
            <p className="text-xs sm:text-sm text-primary-foreground/70 mt-0.5 sm:mt-1">Meubles disponibles</p>
          </div>
          <div className="text-center border-x border-primary-foreground/20">
            <p className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-accent">15+</p>
            <p className="text-xs sm:text-sm text-primary-foreground/70 mt-0.5 sm:mt-1">Partenaires</p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-accent">3D</p>
            <p className="text-xs sm:text-sm text-primary-foreground/70 mt-0.5 sm:mt-1">Visualisation</p>
          </div>
        </div>
      </div>

      {/* Scroll indicator - hidden on very small screens */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in hidden sm:block" style={{ animationDelay: "1.2s" }}>
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-primary-foreground/50 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
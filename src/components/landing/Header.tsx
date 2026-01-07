import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Box, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-card/95 backdrop-blur-md shadow-elegant border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl gradient-gold flex items-center justify-center">
              <Box className="w-5 h-5 md:w-6 md:h-6 text-accent-foreground" />
            </div>
            <span className={`font-display text-xl md:text-2xl font-bold transition-colors ${
              isScrolled ? "text-foreground" : "text-primary-foreground"
            }`}>
              RoomViz
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className={`text-sm font-medium transition-colors hover:text-accent ${
                isScrolled ? "text-muted-foreground" : "text-primary-foreground/80"
              }`}
            >
              Fonctionnalités
            </a>
            <a
              href="#"
              className={`text-sm font-medium transition-colors hover:text-accent ${
                isScrolled ? "text-muted-foreground" : "text-primary-foreground/80"
              }`}
            >
              Partenaires
            </a>
            <a
              href="#"
              className={`text-sm font-medium transition-colors hover:text-accent ${
                isScrolled ? "text-muted-foreground" : "text-primary-foreground/80"
              }`}
            >
              Tarifs
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              className={`${
                isScrolled
                  ? "text-foreground hover:bg-muted"
                  : "text-primary-foreground hover:bg-primary-foreground/10"
              }`}
            >
              <Link to="/auth">Connexion</Link>
            </Button>
            <Button asChild className="gradient-gold text-accent-foreground hover:opacity-90 shadow-gold">
              <Link to="/auth?tab=signup">Commencer</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? "text-foreground" : "text-primary-foreground"}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? "text-foreground" : "text-primary-foreground"}`} />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-card border-t border-border/50 py-4">
            <nav className="flex flex-col gap-2">
              <a
                href="#features"
                className="text-foreground hover:text-accent px-4 py-2 text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Fonctionnalités
              </a>
              <a
                href="#"
                className="text-foreground hover:text-accent px-4 py-2 text-sm font-medium"
              >
                Partenaires
              </a>
              <a
                href="#"
                className="text-foreground hover:text-accent px-4 py-2 text-sm font-medium"
              >
                Tarifs
              </a>
              <div className="flex flex-col gap-2 px-4 pt-4 border-t border-border/50 mt-2">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/auth">Connexion</Link>
                </Button>
                <Button asChild className="w-full gradient-gold text-accent-foreground">
                  <Link to="/auth?tab=signup">Commencer</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
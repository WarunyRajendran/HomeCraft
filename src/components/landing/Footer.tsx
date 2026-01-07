import { Box } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                <Box className="w-6 h-6 text-accent-foreground" />
              </div>
              <span className="font-display text-2xl font-bold text-primary-foreground">RoomViz</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Visualisez votre intérieur idéal en 3D avec les meubles des plus grandes enseignes.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Produit</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-primary-foreground/70 hover:text-accent text-sm transition-colors">Fonctionnalités</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-accent text-sm transition-colors">Tarifs</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-accent text-sm transition-colors">Télécharger l'app</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Entreprise</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-primary-foreground/70 hover:text-accent text-sm transition-colors">À propos</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-accent text-sm transition-colors">Partenaires</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-accent text-sm transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Légal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-primary-foreground/70 hover:text-accent text-sm transition-colors">Confidentialité</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-accent text-sm transition-colors">CGU</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-accent text-sm transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/50 text-sm">
            © 2025 RoomViz. Tous droits réservés.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-primary-foreground/50 hover:text-accent text-sm transition-colors">Twitter</a>
            <a href="#" className="text-primary-foreground/50 hover:text-accent text-sm transition-colors">Instagram</a>
            <a href="#" className="text-primary-foreground/50 hover:text-accent text-sm transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
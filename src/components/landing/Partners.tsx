const partners = [
  { name: "IKEA", initial: "IK" },
  { name: "Conforama", initial: "CF" },
  { name: "But", initial: "BT" },
  { name: "Maisons du Monde", initial: "MM" },
  { name: "Habitat", initial: "HB" },
  { name: "La Redoute", initial: "LR" },
];

const Partners = () => {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Partenaires
          </span>
          <h2 className="font-display text-2xl md:text-4xl font-bold text-card-foreground mb-4">
            Des meubles des plus grandes enseignes
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Découvrez les catalogues de nos partenaires de confiance directement dans l'application.
          </p>
        </div>

        {/* Partners logos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {partners.map((partner, index) => (
            <div
              key={partner.name}
              className="group flex flex-col items-center justify-center p-8 rounded-2xl bg-muted/50 hover:bg-accent/10 border border-transparent hover:border-accent/30 transition-all duration-300 cursor-pointer opacity-0 animate-scale-in"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 group-hover:bg-accent/20 flex items-center justify-center mb-4 transition-colors duration-300">
                <span className="font-display text-xl font-bold text-primary group-hover:text-accent transition-colors duration-300">
                  {partner.initial}
                </span>
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                {partner.name}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <p className="text-center mt-10 text-muted-foreground">
          Vous êtes une enseigne ?{" "}
          <a href="mailto:partenaires@roomviz.fr" className="text-accent hover:underline font-medium">
            Devenez partenaire
          </a>
        </p>
      </div>
    </section>
  );
};

export default Partners;
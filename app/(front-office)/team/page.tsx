export default function TeamPage() {
  const teamMembers = [
    {
      name: "Marie Kouassi",
      role: "Directrice Générale",
      description: "Passionnée de tourisme et d'hospitalité, Marie dirige Dolci Rêva avec vision et détermination."
    },
    {
      name: "Jean-Baptiste Yapi",
      role: "Directeur des Opérations",
      description: "Expert en gestion d'expériences client, Jean-Baptiste assure l'excellence opérationnelle."
    },
    {
      name: "Aminata Diallo",
      role: "Responsable Marketing",
      description: "Créative et dynamique, Aminata développe notre présence digitale et nos partenariats."
    },
    {
      name: "Koffi N'Guessan",
      role: "Chef de Projet",
      description: "Spécialiste en développement de produits, Koffi transforme les idées en réalité."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <section className="relative py-20 lg:py-28 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-96 h-96 bg-theme-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-theme-accent rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 text-center">
              Notre équipe
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-theme-primary to-theme-accent mx-auto mb-12 rounded-full"></div>

            <p className="text-lg text-slate-600 leading-relaxed mb-12 text-center max-w-3xl mx-auto">
              Rencontrez les personnes passionnées qui font de Dolci Rêva une expérience exceptionnelle.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-theme-primary to-theme-accent rounded-full flex items-center justify-center mb-6 mx-auto">
                    <span className="text-white text-2xl font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">
                    {member.name}
                  </h3>
                  <p className="text-theme-primary font-semibold mb-4 text-center">
                    {member.role}
                  </p>
                  <p className="text-slate-600 leading-relaxed text-center">
                    {member.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


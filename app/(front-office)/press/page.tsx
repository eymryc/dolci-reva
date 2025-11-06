export default function PressPage() {
  const pressReleases = [
    {
      date: "15 Janvier 2024",
      title: "Lancement de Dolci Rêva",
      description: "Dolci Rêva annonce son lancement officiel pour révolutionner le tourisme en Côte d'Ivoire."
    },
    {
      date: "20 Février 2024",
      title: "Partenariat avec les hôtels de luxe",
      description: "Nouveau partenariat stratégique avec les plus grands hôtels du pays."
    },
    {
      date: "10 Mars 2024",
      title: "Expansion des services",
      description: "Dolci Rêva étend ses services aux restaurants et lounges premium."
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
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 text-center">
              Presse
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-theme-primary to-theme-accent mx-auto mb-12 rounded-full"></div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-12 shadow-lg border border-slate-200/50 mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Presse</h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Pour toute demande de presse, interview ou information, veuillez nous contacter à :
              </p>
              <div className="space-y-2 text-slate-600">
                <p><strong className="text-slate-900">Email :</strong> press@dolcireva.com</p>
                <p><strong className="text-slate-900">Téléphone :</strong> +225 XX XX XX XX</p>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Communiqués de presse</h2>
              <div className="space-y-6">
                {pressReleases.map((release, index) => (
                  <div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-slate-200/50 hover:shadow-lg transition-all duration-300"
                  >
                    <p className="text-theme-primary font-semibold mb-2">{release.date}</p>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      {release.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {release.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-12 shadow-lg border border-slate-200/50">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Kit Presse</h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Téléchargez notre kit presse contenant notre logo, nos photos et nos informations de contact.
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-theme-primary to-theme-accent text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105">
                Télécharger le kit presse
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


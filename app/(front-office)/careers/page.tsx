import Link from "next/link";

export default function CareersPage() {
  const positions = [
    {
      title: "Développeur Full Stack",
      department: "Technologie",
      location: "Abidjan",
      type: "Temps plein"
    },
    {
      title: "Responsable Marketing Digital",
      department: "Marketing",
      location: "Abidjan",
      type: "Temps plein"
    },
    {
      title: "Conseiller Client",
      department: "Service Client",
      location: "Abidjan",
      type: "Temps plein"
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
              Carrières
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-theme-primary to-theme-accent mx-auto mb-12 rounded-full"></div>

            <p className="text-lg text-slate-600 leading-relaxed mb-12 text-center">
              Rejoignez notre équipe et participez à la transformation du tourisme en Côte d&apos;Ivoire.
            </p>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-12 shadow-lg border border-slate-200/50 mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Pourquoi nous rejoindre ?</h2>
              <ul className="space-y-4 text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="text-theme-primary font-bold text-xl">•</span>
                  <span>Un environnement de travail dynamique et innovant</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-theme-primary font-bold text-xl">•</span>
                  <span>Des opportunités de croissance et de développement professionnel</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-theme-primary font-bold text-xl">•</span>
                  <span>Un impact réel sur le secteur du tourisme ivoirien</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-theme-primary font-bold text-xl">•</span>
                  <span>Une équipe passionnée et collaborative</span>
                </li>
              </ul>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Postes ouverts</h2>
              <div className="space-y-4">
                {positions.map((position, index) => (
                  <div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-slate-200/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                          {position.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                          <span>{position.department}</span>
                          <span>•</span>
                          <span>{position.location}</span>
                          <span>•</span>
                          <span>{position.type}</span>
                        </div>
                      </div>
                      <Link
                        href="/contact"
                        className="px-6 py-2 bg-gradient-to-r from-theme-primary to-theme-accent text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 text-center"
                      >
                        Postuler
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-12 shadow-lg border border-slate-200/50 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Vous ne trouvez pas le poste idéal ?
              </h2>
              <p className="text-slate-600 mb-6">
                Envoyez-nous votre candidature spontanée et nous vous contacterons si une opportunité correspond à votre profil.
              </p>
              <Link
                href="/contact"
                className="inline-block px-8 py-3 bg-gradient-to-r from-theme-primary to-theme-accent text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Candidature spontanée
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


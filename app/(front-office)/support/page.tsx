export default function SupportPage() {
  const supportOptions = [
    {
      icon: "💬",
      title: "Chat en direct",
      description: "Discutez avec notre équipe en temps réel",
      available: "Disponible 24/7"
    },
    {
      icon: "📧",
      title: "Email",
      description: "Envoyez-nous un email et recevez une réponse sous 24h",
      available: "support@dolcireva.com"
    },
    {
      icon: "📞",
      title: "Téléphone",
      description: "Appelez-nous pour une assistance immédiate",
      available: "+225 XX XX XX XX"
    },
    {
      icon: "📚",
      title: "Centre d'aide",
      description: "Consultez notre base de connaissances",
      available: "Articles et guides"
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
              Support technique
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-theme-primary to-theme-accent mx-auto mb-12 rounded-full"></div>

            <p className="text-lg text-slate-600 leading-relaxed mb-12 text-center">
              Nous sommes là pour vous aider. Choisissez le moyen de contact qui vous convient le mieux.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {supportOptions.map((option, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center"
                >
                  <div className="text-5xl mb-4">{option.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {option.title}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {option.description}
                  </p>
                  <p className="text-theme-primary font-semibold">
                    {option.available}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-12 shadow-lg border border-slate-200/50">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Problèmes techniques courants</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-theme-primary pl-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Je ne peux pas me connecter à mon compte</h3>
                  <p className="text-slate-600">
                    Vérifiez que vous utilisez la bonne adresse email et mot de passe. Si le problème persiste, utilisez la fonction &quot;Mot de passe oublié&quot; ou contactez notre support.
                  </p>
                </div>
                <div className="border-l-4 border-theme-primary pl-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Le paiement ne fonctionne pas</h3>
                  <p className="text-slate-600">
                    Assurez-vous que votre carte bancaire est valide et que vous avez suffisamment de fonds. Vérifiez également que les informations de votre carte sont correctes.
                  </p>
                </div>
                <div className="border-l-4 border-theme-primary pl-4">
                  <h3 className="font-semibold text-slate-900 mb-2">La page ne se charge pas correctement</h3>
                  <p className="text-slate-600">
                    Essayez de rafraîchir la page (F5) ou de vider le cache de votre navigateur. Si le problème persiste, contactez notre équipe technique.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


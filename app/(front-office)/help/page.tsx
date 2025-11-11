import HeroSection from '@/components/sections/HeroSection';

export default function HelpPage() {
  const helpCategories = [
    {
      title: "Réservations",
      questions: [
        {
          q: "Comment faire une réservation ?",
          a: "Vous pouvez faire une réservation directement sur notre site en sélectionnant votre destination, vos dates et en suivant les étapes de paiement."
        },
        {
          q: "Puis-je modifier ma réservation ?",
          a: "Oui, vous pouvez modifier votre réservation jusqu'à 48h avant la date d'arrivée. Contactez-nous pour toute modification."
        },
        {
          q: "Quelle est la politique d'annulation ?",
          a: "Les annulations gratuites sont possibles jusqu'à 48h avant l'arrivée. Après ce délai, des frais peuvent s'appliquer."
        }
      ]
    },
    {
      title: "Paiements",
      questions: [
        {
          q: "Quels modes de paiement acceptez-vous ?",
          a: "Nous acceptons les cartes bancaires (Visa, Mastercard), les virements bancaires et les paiements mobiles."
        },
        {
          q: "Mon paiement est-il sécurisé ?",
          a: "Oui, tous nos paiements sont sécurisés via des protocoles SSL et nos partenaires de paiement certifiés."
        }
      ]
    },
    {
      title: "Compte",
      questions: [
        {
          q: "Comment créer un compte ?",
          a: "Cliquez sur 'S'inscrire' en haut à droite de la page, remplissez le formulaire et confirmez votre email."
        },
        {
          q: "J'ai oublié mon mot de passe",
          a: "Cliquez sur 'Mot de passe oublié' sur la page de connexion et suivez les instructions envoyées par email."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <HeroSection
        title="Centre d'aide"
        subtitle="Trouvez rapidement les réponses à vos questions les plus fréquentes"
        backgroundImage="/media/slide/slide3.jpg"
      />
      
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="w-24 h-1 bg-gradient-to-r from-theme-primary to-theme-accent mx-auto mb-12 rounded-full"></div>

            <div className="space-y-8">
              {helpCategories.map((category, categoryIndex) => (
                <div
                  key={categoryIndex}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200/50"
                >
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    {category.title}
                  </h2>
                  <div className="space-y-6">
                    {category.questions.map((item, itemIndex) => (
                      <div key={itemIndex} className="border-l-4 border-theme-primary pl-4">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {item.q}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                          {item.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-12 shadow-lg border border-slate-200/50 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Vous ne trouvez pas la réponse ?
              </h2>
              <p className="text-slate-600 mb-6">
                Notre équipe est là pour vous aider. Contactez-nous et nous vous répondrons dans les plus brefs délais.
              </p>
              <a
                href="/contact"
                className="inline-block px-8 py-3 bg-gradient-to-r from-theme-primary to-theme-accent text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


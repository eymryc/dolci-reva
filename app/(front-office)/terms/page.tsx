export default function TermsPage() {
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
              Conditions d&apos;utilisation
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-theme-primary to-theme-accent mx-auto mb-12 rounded-full"></div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-12 shadow-lg border border-slate-200/50 prose prose-lg max-w-none">
              <p className="text-sm text-slate-500 mb-8">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptation des conditions</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  En accédant et en utilisant le site web Dolci Rêva, vous acceptez d&apos;être lié par les présentes conditions d&apos;utilisation. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser notre site.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Utilisation du site</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Vous vous engagez à utiliser notre site de manière légale et conforme à ces conditions. Il est interdit d&apos;utiliser le site pour :
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                  <li>Violer toute loi ou réglementation applicable</li>
                  <li>Transmettre des virus ou tout code malveillant</li>
                  <li>Tenter d&apos;accéder de manière non autorisée à nos systèmes</li>
                  <li>Reproduire ou copier le contenu sans autorisation</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Réservations et paiements</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Les réservations effectuées sur notre site sont soumises à disponibilité. Les prix affichés sont en francs CFA et incluent toutes les taxes applicables. Le paiement doit être effectué selon les modalités indiquées lors de la réservation.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Politique d&apos;annulation</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Les conditions d&apos;annulation varient selon les établissements. En général, les annulations gratuites sont possibles jusqu&apos;à 48h avant la date d&apos;arrivée. Après ce délai, des frais d&apos;annulation peuvent s&apos;appliquer.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Propriété intellectuelle</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Tout le contenu de ce site, incluant mais sans s&apos;y limiter, les textes, graphiques, logos, images, est la propriété de Dolci Rêva et est protégé par les lois sur la propriété intellectuelle.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Limitation de responsabilité</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Dolci Rêva agit en tant qu&apos;intermédiaire entre les utilisateurs et les établissements. Nous ne sommes pas responsables des dommages directs ou indirects résultant de l&apos;utilisation de nos services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Modifications des conditions</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prendront effet dès leur publication sur le site. Il est de votre responsabilité de consulter régulièrement ces conditions.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Contact</h2>
                <p className="text-slate-600 leading-relaxed">
                  Pour toute question concernant ces conditions d&apos;utilisation, veuillez nous contacter à : <a href="/contact" className="text-theme-primary hover:underline">contact@dolcireva.com</a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


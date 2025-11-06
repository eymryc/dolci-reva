export default function PrivacyPage() {
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
              Politique de confidentialité
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-theme-primary to-theme-accent mx-auto mb-12 rounded-full"></div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-12 shadow-lg border border-slate-200/50 prose prose-lg max-w-none">
              <p className="text-sm text-slate-500 mb-8">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Dolci Rêva s&apos;engage à protéger votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations personnelles lorsque vous utilisez notre site web.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Informations collectées</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Nous collectons les informations suivantes :
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone</li>
                  <li>Informations de paiement (traitées de manière sécurisée)</li>
                  <li>Données de navigation et cookies</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Utilisation des informations</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Nous utilisons vos informations pour :
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                  <li>Traiter vos réservations</li>
                  <li>Vous contacter concernant vos réservations</li>
                  <li>Améliorer nos services</li>
                  <li>Vous envoyer des communications marketing (avec votre consentement)</li>
                  <li>Respecter nos obligations légales</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Partage des informations</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Nous ne vendons pas vos informations personnelles. Nous pouvons partager vos informations uniquement avec :
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                  <li>Les établissements que vous réservez</li>
                  <li>Nos prestataires de services (paiement, hébergement)</li>
                  <li>Les autorités si requis par la loi</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Sécurité des données</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations personnelles contre tout accès non autorisé, altération, divulgation ou destruction.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Vos droits</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Vous avez le droit de :
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                  <li>Accéder à vos données personnelles</li>
                  <li>Corriger vos données personnelles</li>
                  <li>Demander la suppression de vos données</li>
                  <li>Vous opposer au traitement de vos données</li>
                  <li>Retirer votre consentement à tout moment</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Cookies</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Notre site utilise des cookies pour améliorer votre expérience. Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur. Pour plus d&apos;informations, consultez notre <a href="/cookies" className="text-theme-primary hover:underline">politique de cookies</a>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Contact</h2>
                <p className="text-slate-600 leading-relaxed">
                  Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, contactez-nous à : <a href="/contact" className="text-theme-primary hover:underline">contact@dolcireva.com</a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


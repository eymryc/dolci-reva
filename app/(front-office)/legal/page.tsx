export default function LegalPage() {
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
              Mentions légales
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-theme-primary to-theme-accent mx-auto mb-12 rounded-full"></div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-12 shadow-lg border border-slate-200/50 prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Informations légales</h2>
                <div className="text-slate-600 space-y-2">
                  <p><strong className="text-slate-900">Raison sociale :</strong> Dolci Rêva</p>
                  <p><strong className="text-slate-900">Forme juridique :</strong> Société à Responsabilité Limitée (SARL)</p>
                  <p><strong className="text-slate-900">Siège social :</strong> Abidjan, Côte d&apos;Ivoire</p>
                  <p><strong className="text-slate-900">RCCM :</strong> CI-ABJ-XX-XXXXX</p>
                  <p><strong className="text-slate-900">N° d&apos;identification fiscale :</strong> CI-XXXXXXXXX</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Directeur de publication</h2>
                <p className="text-slate-600 leading-relaxed">
                  Le directeur de la publication est le représentant légal de Dolci Rêva.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Hébergement</h2>
                <p className="text-slate-600 leading-relaxed">
                  Ce site est hébergé par un prestataire de services d&apos;hébergement web. Pour toute question concernant l&apos;hébergement, veuillez nous contacter.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Propriété intellectuelle</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  L&apos;ensemble de ce site relève de la législation ivoirienne et internationale sur le droit d&apos;auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  La reproduction de tout ou partie de ce site sur un support électronique ou autre est formellement interdite sauf autorisation expresse du directeur de la publication.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Protection des données personnelles</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Conformément à la loi n° 2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel en Côte d&apos;Ivoire, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression des données vous concernant.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Pour exercer ce droit, vous pouvez nous contacter à l&apos;adresse : <a href="/contact" className="text-theme-primary hover:underline">contact@dolcireva.com</a>
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Responsabilité</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Les informations contenues sur ce site sont aussi précises que possible et le site est périodiquement remis à jour, mais peut toutefois contenir des inexactitudes, des omissions ou des lacunes.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Dolci Rêva ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l&apos;utilisateur, lors de l&apos;accès au site, et résultant soit de l&apos;utilisation d&apos;un matériel ne répondant pas aux spécifications, soit de l&apos;apparition d&apos;un bug ou d&apos;une incompatibilité.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Liens hypertextes</h2>
                <p className="text-slate-600 leading-relaxed">
                  Le site peut contenir des liens hypertextes vers d&apos;autres sites présents sur le réseau Internet. Les liens vers ces autres ressources vous font quitter le site. Il est possible de créer un lien vers la page de présentation de ce site sans autorisation expresse de l&apos;éditeur.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Droit applicable</h2>
                <p className="text-slate-600 leading-relaxed">
                  Tout litige en relation avec l&apos;utilisation du site est soumis au droit ivoirien. Il est fait attribution exclusive de juridiction aux tribunaux compétents d&apos;Abidjan.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Contact</h2>
                <p className="text-slate-600 leading-relaxed">
                  Pour toute question concernant ces mentions légales, vous pouvez nous contacter à : <a href="/contact" className="text-theme-primary hover:underline">contact@dolcireva.com</a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


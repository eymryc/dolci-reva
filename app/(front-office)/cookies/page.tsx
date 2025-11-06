export default function CookiesPage() {
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
              Politique de cookies
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-theme-primary to-theme-accent mx-auto mb-12 rounded-full"></div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-12 shadow-lg border border-slate-200/50 prose prose-lg max-w-none">
              <p className="text-sm text-slate-500 mb-8">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez un site web. Les cookies permettent au site de mémoriser vos actions et préférences pendant une certaine période, évitant ainsi de devoir les ressaisir à chaque visite.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Types de cookies utilisés</h2>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Cookies essentiels</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Ces cookies sont nécessaires au fonctionnement du site. Ils permettent des fonctionnalités de base comme la navigation et l&apos;accès aux zones sécurisées du site.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Cookies de performance</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Ces cookies collectent des informations sur la façon dont vous utilisez notre site, comme les pages que vous visitez le plus souvent. Ces données nous aident à améliorer le fonctionnement du site.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Cookies de fonctionnalité</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Ces cookies permettent au site de se souvenir de vos choix (comme votre langue ou votre région) et fournissent des fonctionnalités améliorées et personnalisées.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Cookies marketing</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Ces cookies sont utilisés pour vous montrer des publicités qui sont plus pertinentes pour vous et vos intérêts. Ils sont également utilisés pour limiter le nombre de fois que vous voyez une publicité.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Gestion des cookies</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Vous pouvez contrôler et/ou supprimer les cookies comme vous le souhaitez. Vous pouvez supprimer tous les cookies déjà présents sur votre ordinateur et configurer la plupart des navigateurs pour empêcher leur placement.
                </p>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Voici comment gérer les cookies dans les principaux navigateurs :
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                  <li><strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies</li>
                  <li><strong>Firefox :</strong> Options → Vie privée et sécurité → Cookies</li>
                  <li><strong>Safari :</strong> Préférences → Confidentialité → Cookies</li>
                  <li><strong>Edge :</strong> Paramètres → Confidentialité → Cookies</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Cookies tiers</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Certains cookies sont placés par des services tiers qui apparaissent sur nos pages. Nous n&apos;avons pas le contrôle sur ces cookies. Nous vous encourageons à consulter les politiques de cookies de ces services tiers.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Consentement</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  En continuant à utiliser notre site, vous acceptez l&apos;utilisation de cookies conformément à cette politique. Si vous n&apos;acceptez pas l&apos;utilisation de cookies, veuillez désactiver les cookies dans les paramètres de votre navigateur.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Contact</h2>
                <p className="text-slate-600 leading-relaxed">
                  Pour toute question concernant notre utilisation des cookies, contactez-nous à : <a href="/contact" className="text-theme-primary hover:underline">contact@dolcireva.com</a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


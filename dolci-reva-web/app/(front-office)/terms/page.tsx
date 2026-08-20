import StaticPageShell from "@/components/sections/StaticPageShell";

const panel =
  "border border-[#12100c]/10 bg-white p-8 shadow-[0_20px_50px_-30px_rgba(18,16,12,0.45)] lg:p-12";

export default function TermsPage() {
  return (
    <StaticPageShell
      eyebrow="Légal"
      title="Conditions d'utilisation"
      subtitle="Les règles qui encadrent l'usage de Dolci Rêva."
      narrow
    >
      <div className={`${panel} prose prose-lg max-w-none`}>
        <p className="mb-8 text-sm text-[#12100c]/50">
          Dernière mise à jour :{" "}
          {new Date().toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">
            1. Acceptation des conditions
          </h2>
          <p className="mb-4 leading-relaxed text-[#12100c]/70">
            En accédant et en utilisant le site web Dolci Rêva, vous acceptez
            d&apos;être lié par les présentes conditions d&apos;utilisation. Si vous
            n&apos;acceptez pas ces conditions, veuillez ne pas utiliser notre site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">2. Utilisation du site</h2>
          <p className="mb-4 leading-relaxed text-[#12100c]/70">
            Vous vous engagez à utiliser notre site de manière légale et conforme à
            ces conditions. Il est interdit d&apos;utiliser le site pour :
          </p>
          <ul className="ml-4 list-inside list-disc space-y-2 text-[#12100c]/70">
            <li>Violer toute loi ou réglementation applicable</li>
            <li>Transmettre des virus ou tout code malveillant</li>
            <li>Tenter d&apos;accéder de manière non autorisée à nos systèmes</li>
            <li>Reproduire ou copier le contenu sans autorisation</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">
            3. Réservations et paiements
          </h2>
          <p className="mb-4 leading-relaxed text-[#12100c]/70">
            Les réservations effectuées sur notre site sont soumises à disponibilité.
            Les prix affichés sont en francs CFA et incluent toutes les taxes
            applicables. Le paiement doit être effectué selon les modalités indiquées
            lors de la réservation.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">
            4. Politique d&apos;annulation
          </h2>
          <p className="mb-4 leading-relaxed text-[#12100c]/70">
            Les conditions d&apos;annulation varient selon les établissements. En
            général, les annulations gratuites sont possibles jusqu&apos;à 48h avant
            la date d&apos;arrivée. Après ce délai, des frais d&apos;annulation
            peuvent s&apos;appliquer.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">
            5. Propriété intellectuelle
          </h2>
          <p className="mb-4 leading-relaxed text-[#12100c]/70">
            Tout le contenu de ce site, incluant mais sans s&apos;y limiter, les
            textes, graphiques, logos, images, est la propriété de Dolci Rêva et est
            protégé par les lois sur la propriété intellectuelle.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">
            6. Limitation de responsabilité
          </h2>
          <p className="mb-4 leading-relaxed text-[#12100c]/70">
            Dolci Rêva agit en tant qu&apos;intermédiaire entre les utilisateurs et
            les établissements. Nous ne sommes pas responsables des dommages directs
            ou indirects résultant de l&apos;utilisation de nos services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">
            7. Modifications des conditions
          </h2>
          <p className="mb-4 leading-relaxed text-[#12100c]/70">
            Nous nous réservons le droit de modifier ces conditions à tout moment.
            Les modifications prendront effet dès leur publication sur le site. Il
            est de votre responsabilité de consulter régulièrement ces conditions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">8. Contact</h2>
          <p className="leading-relaxed text-[#12100c]/70">
            Pour toute question concernant ces conditions d&apos;utilisation,
            veuillez nous contacter à :{" "}
            <a
              href="mailto:contact@dolcireva.com"
              className="text-[#f08400] hover:underline"
            >
              contact@dolcireva.com
            </a>
          </p>
        </section>
      </div>
    </StaticPageShell>
  );
}

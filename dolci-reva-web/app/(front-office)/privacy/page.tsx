import StaticPageShell from "@/components/sections/StaticPageShell";

const panel =
  "border border-[#12100c]/10 bg-white p-8 shadow-[0_20px_50px_-30px_rgba(18,16,12,0.45)] lg:p-12";

export default function PrivacyPage() {
  return (
    <StaticPageShell
      eyebrow="Légal"
      title="Politique de confidentialité"
      subtitle="Comment nous collectons, utilisons et protégeons vos données."
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
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">1. Introduction</h2>
          <p className="mb-4 leading-relaxed text-[#12100c]/70">
            Dolci Rêva s&apos;engage à protéger votre vie privée. Cette politique de
            confidentialité explique comment nous collectons, utilisons et protégeons
            vos informations personnelles lorsque vous utilisez notre site web.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">
            2. Informations collectées
          </h2>
          <p className="mb-4 leading-relaxed text-[#12100c]/70">
            Nous collectons les informations suivantes :
          </p>
          <ul className="ml-4 list-inside list-disc space-y-2 text-[#12100c]/70">
            <li>Nom et prénom</li>
            <li>Adresse email</li>
            <li>Numéro de téléphone</li>
            <li>Informations de paiement (traitées de manière sécurisée)</li>
            <li>Données de navigation et cookies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">
            3. Utilisation des informations
          </h2>
          <p className="mb-4 leading-relaxed text-[#12100c]/70">
            Nous utilisons vos informations pour :
          </p>
          <ul className="ml-4 list-inside list-disc space-y-2 text-[#12100c]/70">
            <li>Traiter vos réservations</li>
            <li>Vous contacter concernant vos réservations</li>
            <li>Améliorer nos services</li>
            <li>Vous envoyer des communications marketing (avec votre consentement)</li>
            <li>Respecter nos obligations légales</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">
            4. Partage des informations
          </h2>
          <p className="mb-4 leading-relaxed text-[#12100c]/70">
            Nous ne vendons pas vos informations personnelles. Nous pouvons partager
            vos informations uniquement avec :
          </p>
          <ul className="ml-4 list-inside list-disc space-y-2 text-[#12100c]/70">
            <li>Les établissements que vous réservez</li>
            <li>Nos prestataires de services (paiement, hébergement)</li>
            <li>Les autorités si requis par la loi</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">5. Sécurité des données</h2>
          <p className="mb-4 leading-relaxed text-[#12100c]/70">
            Nous mettons en œuvre des mesures de sécurité appropriées pour protéger
            vos informations personnelles contre tout accès non autorisé, altération,
            divulgation ou destruction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">6. Vos droits</h2>
          <p className="mb-4 leading-relaxed text-[#12100c]/70">Vous avez le droit de :</p>
          <ul className="ml-4 list-inside list-disc space-y-2 text-[#12100c]/70">
            <li>Accéder à vos données personnelles</li>
            <li>Corriger vos données personnelles</li>
            <li>Demander la suppression de vos données</li>
            <li>Vous opposer au traitement de vos données</li>
            <li>Retirer votre consentement à tout moment</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">7. Cookies</h2>
          <p className="mb-4 leading-relaxed text-[#12100c]/70">
            Notre site utilise des cookies pour améliorer votre expérience. Vous
            pouvez gérer vos préférences de cookies dans les paramètres de votre
            navigateur. Pour plus d&apos;informations, consultez notre{" "}
            <a href="/cookies" className="text-[#f08400] hover:underline">
              politique de cookies
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">8. Contact</h2>
          <p className="leading-relaxed text-[#12100c]/70">
            Pour toute question concernant cette politique de confidentialité ou pour
            exercer vos droits, contactez-nous à :{" "}
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

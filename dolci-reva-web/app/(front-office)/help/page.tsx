import StaticPageShell from "@/components/sections/StaticPageShell";

const panel =
  "border border-[#12100c]/10 bg-white p-8 shadow-[0_20px_50px_-30px_rgba(18,16,12,0.45)] lg:p-12";
const cta =
  "inline-block bg-[#f08400] px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#d97400]";

export default function HelpPage() {
  const helpCategories = [
    {
      title: "Réservations",
      questions: [
        {
          q: "Comment faire une réservation ?",
          a: "Vous pouvez faire une réservation directement sur notre site en sélectionnant votre destination, vos dates et en suivant les étapes de paiement.",
        },
        {
          q: "Puis-je modifier ma réservation ?",
          a: "Oui, vous pouvez modifier votre réservation jusqu'à 48h avant la date d'arrivée. Contactez-nous pour toute modification.",
        },
        {
          q: "Quelle est la politique d'annulation ?",
          a: "Les annulations gratuites sont possibles jusqu'à 48h avant l'arrivée. Après ce délai, des frais peuvent s'appliquer.",
        },
      ],
    },
    {
      title: "Paiements",
      questions: [
        {
          q: "Quels modes de paiement acceptez-vous ?",
          a: "Nous acceptons les cartes bancaires (Visa, Mastercard), les virements bancaires et les paiements mobiles.",
        },
        {
          q: "Mon paiement est-il sécurisé ?",
          a: "Oui, tous nos paiements sont sécurisés via des protocoles SSL et nos partenaires de paiement certifiés.",
        },
      ],
    },
    {
      title: "Compte",
      questions: [
        {
          q: "Comment créer un compte ?",
          a: "Cliquez sur 'S'inscrire' en haut à droite de la page, remplissez le formulaire et confirmez votre email.",
        },
        {
          q: "J'ai oublié mon mot de passe",
          a: "Cliquez sur 'Mot de passe oublié' sur la page de connexion et suivez les instructions envoyées par email.",
        },
      ],
    },
  ];

  return (
    <StaticPageShell
      eyebrow="Aide"
      title="Centre d'aide"
      subtitle="Trouvez rapidement les réponses à vos questions les plus fréquentes."
      narrow
    >
      <div className="space-y-6">
        {helpCategories.map((category) => (
          <div key={category.title} className={panel}>
            <h2 className="mb-6 text-2xl font-bold text-[#12100c]">
              {category.title}
            </h2>
            <div className="space-y-6">
              {category.questions.map((item) => (
                <div key={item.q} className="border-l-2 border-[#f08400] pl-4">
                  <h3 className="mb-2 text-lg font-semibold text-[#12100c]">
                    {item.q}
                  </h3>
                  <p className="leading-relaxed text-[#12100c]/65">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={`${panel} mt-10 text-center`}>
        <h2 className="mb-4 text-2xl font-bold text-[#12100c]">
          Vous ne trouvez pas la réponse ?
        </h2>
        <p className="mb-6 text-[#12100c]/65">
          Notre équipe est là pour vous aider. Contactez-nous et nous vous répondrons
          dans les plus brefs délais.
        </p>
        <a href="mailto:contact@dolcireva.com" className={cta}>
          Nous contacter
        </a>
      </div>
    </StaticPageShell>
  );
}

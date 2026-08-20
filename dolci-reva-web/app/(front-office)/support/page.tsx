import StaticPageShell from "@/components/sections/StaticPageShell";

const panel =
  "border border-[#12100c]/10 bg-white p-8 shadow-[0_20px_50px_-30px_rgba(18,16,12,0.45)] lg:p-12";

export default function SupportPage() {
  const supportOptions = [
    {
      title: "Chat en direct",
      description: "Discutez avec notre équipe en temps réel",
      available: "Disponible 24/7",
    },
    {
      title: "Email",
      description: "Envoyez-nous un email et recevez une réponse sous 24h",
      available: "support@dolcireva.com",
    },
    {
      title: "Téléphone",
      description: "Appelez-nous pour une assistance immédiate",
      available: "+225 XX XX XX XX",
    },
    {
      title: "Centre d'aide",
      description: "Consultez notre base de connaissances",
      available: "Articles et guides",
    },
  ];

  return (
    <StaticPageShell
      eyebrow="Aide"
      title="Support technique"
      subtitle="Choisissez le moyen de contact qui vous convient le mieux."
      narrow
    >
      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        {supportOptions.map((option) => (
          <div
            key={option.title}
            className="border border-[#12100c]/10 bg-white p-8 text-center shadow-[0_20px_50px_-30px_rgba(18,16,12,0.45)] transition-colors hover:border-[#f08400]/40"
          >
            <h3 className="mb-3 text-xl font-bold text-[#12100c]">{option.title}</h3>
            <p className="mb-4 text-[#12100c]/65">{option.description}</p>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#f08400]">
              {option.available}
            </p>
          </div>
        ))}
      </div>

      <div className={panel}>
        <h2 className="mb-6 text-2xl font-bold text-[#12100c]">
          Problèmes techniques courants
        </h2>
        <div className="space-y-6">
          <div className="border-l-2 border-[#f08400] pl-4">
            <h3 className="mb-2 font-semibold text-[#12100c]">
              Je ne peux pas me connecter à mon compte
            </h3>
            <p className="text-[#12100c]/65">
              Vérifiez que vous utilisez la bonne adresse email et mot de passe. Si
              le problème persiste, utilisez la fonction &quot;Mot de passe
              oublié&quot; ou contactez notre support.
            </p>
          </div>
          <div className="border-l-2 border-[#f08400] pl-4">
            <h3 className="mb-2 font-semibold text-[#12100c]">
              Le paiement ne fonctionne pas
            </h3>
            <p className="text-[#12100c]/65">
              Assurez-vous que votre carte bancaire est valide et que vous avez
              suffisamment de fonds. Vérifiez également que les informations de
              votre carte sont correctes.
            </p>
          </div>
          <div className="border-l-2 border-[#f08400] pl-4">
            <h3 className="mb-2 font-semibold text-[#12100c]">
              La page ne se charge pas correctement
            </h3>
            <p className="text-[#12100c]/65">
              Essayez de rafraîchir la page (F5) ou de vider le cache de votre
              navigateur. Si le problème persiste, contactez notre équipe technique.
            </p>
          </div>
        </div>
      </div>
    </StaticPageShell>
  );
}

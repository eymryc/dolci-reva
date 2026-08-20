import StaticPageShell from "@/components/sections/StaticPageShell";

const panel =
  "border border-[#12100c]/10 bg-white p-8 shadow-[0_20px_50px_-30px_rgba(18,16,12,0.45)] lg:p-12";
const cta =
  "inline-block bg-[#f08400] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#d97400]";

export default function PressPage() {
  const pressReleases = [
    {
      date: "15 Janvier 2024",
      title: "Lancement de Dolci Rêva",
      description:
        "Dolci Rêva annonce son lancement officiel pour révolutionner le tourisme en Côte d'Ivoire.",
    },
    {
      date: "20 Février 2024",
      title: "Partenariat avec les hôtels de luxe",
      description:
        "Nouveau partenariat stratégique avec les plus grands hôtels du pays.",
    },
    {
      date: "10 Mars 2024",
      title: "Expansion des services",
      description:
        "Dolci Rêva étend ses services aux restaurants et lounges premium.",
    },
  ];

  return (
    <StaticPageShell
      eyebrow="Médias"
      title="Presse"
      subtitle="Communiqués, contacts et kit presse."
      narrow
    >
      <div className={`${panel} mb-10`}>
        <h2 className="mb-6 text-2xl font-bold text-[#12100c]">Contact Presse</h2>
        <p className="mb-6 leading-relaxed text-[#12100c]/70">
          Pour toute demande de presse, interview ou information, veuillez nous
          contacter à :
        </p>
        <div className="space-y-2 text-[#12100c]/70">
          <p>
            <strong className="text-[#12100c]">Email :</strong> press@dolcireva.com
          </p>
          <p>
            <strong className="text-[#12100c]">Téléphone :</strong> +225 XX XX XX XX
          </p>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="mb-6 text-2xl font-bold text-[#12100c]">
          Communiqués de presse
        </h2>
        <div className="space-y-4">
          {pressReleases.map((release) => (
            <div
              key={release.title}
              className="border border-[#12100c]/10 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(18,16,12,0.45)] transition-colors hover:border-[#f08400]/40"
            >
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#f08400]">
                {release.date}
              </p>
              <h3 className="mb-3 text-xl font-bold text-[#12100c]">
                {release.title}
              </h3>
              <p className="leading-relaxed text-[#12100c]/65">
                {release.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className={panel}>
        <h2 className="mb-6 text-2xl font-bold text-[#12100c]">Kit Presse</h2>
        <p className="mb-6 leading-relaxed text-[#12100c]/70">
          Téléchargez notre kit presse contenant notre logo, nos photos et nos
          informations de contact.
        </p>
        <button type="button" className={cta}>
          Télécharger le kit presse
        </button>
      </div>
    </StaticPageShell>
  );
}

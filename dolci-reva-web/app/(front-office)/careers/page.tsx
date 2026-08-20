import StaticPageShell from "@/components/sections/StaticPageShell";

const panel =
  "border border-[#12100c]/10 bg-white p-8 shadow-[0_20px_50px_-30px_rgba(18,16,12,0.45)] lg:p-12";
const cta =
  "inline-block bg-[#f08400] px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#d97400]";

export default function CareersPage() {
  const positions = [
    {
      title: "Développeur Full Stack",
      department: "Technologie",
      location: "Abidjan",
      type: "Temps plein",
    },
    {
      title: "Responsable Marketing Digital",
      department: "Marketing",
      location: "Abidjan",
      type: "Temps plein",
    },
    {
      title: "Conseiller Client",
      department: "Service Client",
      location: "Abidjan",
      type: "Temps plein",
    },
  ];

  return (
    <StaticPageShell
      eyebrow="Carrières"
      title="Rejoignez-nous"
      subtitle="Participez à la transformation du tourisme en Côte d'Ivoire."
      narrow
    >
      <div className={`${panel} mb-10`}>
        <h2 className="mb-6 text-2xl font-bold text-[#12100c]">
          Pourquoi nous rejoindre ?
        </h2>
        <ul className="space-y-4 text-[#12100c]/70">
          {[
            "Un environnement de travail dynamique et innovant",
            "Des opportunités de croissance et de développement professionnel",
            "Un impact réel sur le secteur du tourisme ivoirien",
            "Une équipe passionnée et collaborative",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 bg-[#f08400]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-10">
        <h2 className="mb-6 text-2xl font-bold text-[#12100c]">Postes ouverts</h2>
        <div className="space-y-4">
          {positions.map((position) => (
            <div
              key={position.title}
              className="border border-[#12100c]/10 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(18,16,12,0.45)] transition-colors hover:border-[#f08400]/40"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="mb-2 text-xl font-bold text-[#12100c]">
                    {position.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-[#12100c]/60">
                    <span>{position.department}</span>
                    <span>•</span>
                    <span>{position.location}</span>
                    <span>•</span>
                    <span>{position.type}</span>
                  </div>
                </div>
                <a href="mailto:contact@dolcireva.com" className={cta}>
                  Postuler
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`${panel} text-center`}>
        <h2 className="mb-4 text-2xl font-bold text-[#12100c]">
          Vous ne trouvez pas le poste idéal ?
        </h2>
        <p className="mb-6 text-[#12100c]/65">
          Envoyez-nous votre candidature spontanée et nous vous contacterons si une
          opportunité correspond à votre profil.
        </p>
        <a href="mailto:contact@dolcireva.com" className={cta}>
          Candidature spontanée
        </a>
      </div>
    </StaticPageShell>
  );
}

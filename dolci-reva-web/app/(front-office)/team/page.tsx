import StaticPageShell from "@/components/sections/StaticPageShell";

const panel =
  "border border-[#12100c]/10 bg-white p-8 shadow-[0_20px_50px_-30px_rgba(18,16,12,0.45)] transition-colors hover:border-[#f08400]/40";

export default function TeamPage() {
  const teamMembers = [
    {
      name: "Marie Kouassi",
      role: "Directrice Générale",
      description:
        "Passionnée de tourisme et d'hospitalité, Marie dirige Dolci Rêva avec vision et détermination.",
    },
    {
      name: "Jean-Baptiste Yapi",
      role: "Directeur des Opérations",
      description:
        "Expert en gestion d'expériences client, Jean-Baptiste assure l'excellence opérationnelle.",
    },
    {
      name: "Aminata Diallo",
      role: "Responsable Marketing",
      description:
        "Créative et dynamique, Aminata développe notre présence digitale et nos partenariats.",
    },
    {
      name: "Koffi N'Guessan",
      role: "Chef de Projet",
      description:
        "Spécialiste en développement de produits, Koffi transforme les idées en réalité.",
    },
  ];

  return (
    <StaticPageShell
      eyebrow="À propos"
      title="Notre équipe"
      subtitle="Les personnes passionnées qui font de Dolci Rêva une expérience exceptionnelle."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
        {teamMembers.map((member) => (
          <div key={member.name} className={`${panel} p-8 text-center`}>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center bg-[#12100c]">
              <span className="text-2xl font-bold text-[#ffb347]">
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <h3 className="mb-2 text-xl font-bold text-[#12100c]">{member.name}</h3>
            <p className="mb-4 font-semibold text-[#f08400]">{member.role}</p>
            <p className="leading-relaxed text-[#12100c]/65">{member.description}</p>
          </div>
        ))}
      </div>
    </StaticPageShell>
  );
}

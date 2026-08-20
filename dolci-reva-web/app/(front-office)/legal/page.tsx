import StaticPageShell from "@/components/sections/StaticPageShell";

const panel =
  "border border-[#12100c]/10 bg-white p-8 shadow-[0_20px_50px_-30px_rgba(18,16,12,0.45)] lg:p-12";

export default function LegalPage() {
  return (
    <StaticPageShell
      eyebrow="Légal"
      title="Mentions légales"
      subtitle="Informations légales relatives à Dolci Rêva."
      narrow
    >
      <div className={`${panel} prose prose-lg max-w-none`}>
        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">1. Informations légales</h2>
          <div className="space-y-2 text-[#12100c]/70">
            <p>
              <strong className="text-[#12100c]">Raison sociale :</strong> Dolci Rêva
            </p>
            <p>
              <strong className="text-[#12100c]">Forme juridique :</strong> Société à
              Responsabilité Limitée (SARL)
            </p>
            <p>
              <strong className="text-[#12100c]">Siège social :</strong> Abidjan, Côte
              d&apos;Ivoire
            </p>
            <p>
              <strong className="text-[#12100c]">RCCM :</strong> CI-ABJ-XX-XXXXX
            </p>
            <p>
              <strong className="text-[#12100c]">N° d&apos;identification fiscale :</strong>{" "}
              CI-XXXXXXXXX
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">
            2. Directeur de publication
          </h2>
          <p className="leading-relaxed text-[#12100c]/70">
            Le directeur de la publication est le représentant légal de Dolci Rêva.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">3. Hébergement</h2>
          <p className="leading-relaxed text-[#12100c]/70">
            Ce site est hébergé par un prestataire de services d&apos;hébergement web.
            Pour toute question concernant l&apos;hébergement, veuillez nous contacter.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">
            4. Propriété intellectuelle
          </h2>
          <p className="mb-4 leading-relaxed text-[#12100c]/70">
            L&apos;ensemble de ce site relève de la législation ivoirienne et
            internationale sur le droit d&apos;auteur et la propriété intellectuelle.
            Tous les droits de reproduction sont réservés, y compris pour les
            documents téléchargeables et les représentations iconographiques et
            photographiques.
          </p>
          <p className="leading-relaxed text-[#12100c]/70">
            La reproduction de tout ou partie de ce site sur un support électronique
            ou autre est formellement interdite sauf autorisation expresse du
            directeur de la publication.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">
            5. Protection des données personnelles
          </h2>
          <p className="mb-4 leading-relaxed text-[#12100c]/70">
            Conformément à la loi n° 2013-450 du 19 juin 2013 relative à la
            protection des données à caractère personnel en Côte d&apos;Ivoire, vous
            disposez d&apos;un droit d&apos;accès, de rectification et de suppression
            des données vous concernant.
          </p>
          <p className="leading-relaxed text-[#12100c]/70">
            Pour exercer ce droit, vous pouvez nous contacter à l&apos;adresse :{" "}
            <a
              href="mailto:contact@dolcireva.com"
              className="text-[#f08400] hover:underline"
            >
              contact@dolcireva.com
            </a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">6. Responsabilité</h2>
          <p className="mb-4 leading-relaxed text-[#12100c]/70">
            Les informations contenues sur ce site sont aussi précises que possible
            et le site est périodiquement remis à jour, mais peut toutefois contenir
            des inexactitudes, des omissions ou des lacunes.
          </p>
          <p className="leading-relaxed text-[#12100c]/70">
            Dolci Rêva ne pourra être tenu responsable des dommages directs et
            indirects causés au matériel de l&apos;utilisateur, lors de l&apos;accès
            au site, et résultant soit de l&apos;utilisation d&apos;un matériel ne
            répondant pas aux spécifications, soit de l&apos;apparition d&apos;un bug
            ou d&apos;une incompatibilité.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">7. Liens hypertextes</h2>
          <p className="leading-relaxed text-[#12100c]/70">
            Le site peut contenir des liens hypertextes vers d&apos;autres sites
            présents sur le réseau Internet. Les liens vers ces autres ressources
            vous font quitter le site. Il est possible de créer un lien vers la page
            de présentation de ce site sans autorisation expresse de l&apos;éditeur.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">8. Droit applicable</h2>
          <p className="leading-relaxed text-[#12100c]/70">
            Tout litige en relation avec l&apos;utilisation du site est soumis au
            droit ivoirien. Il est fait attribution exclusive de juridiction aux
            tribunaux compétents d&apos;Abidjan.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">9. Contact</h2>
          <p className="leading-relaxed text-[#12100c]/70">
            Pour toute question concernant ces mentions légales, vous pouvez nous
            contacter à :{" "}
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

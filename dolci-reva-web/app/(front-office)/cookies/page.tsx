import StaticPageShell from "@/components/sections/StaticPageShell";

const panel =
  "border border-[#12100c]/10 bg-white p-8 shadow-[0_20px_50px_-30px_rgba(18,16,12,0.45)] lg:p-12";

export default function CookiesPage() {
  return (
    <StaticPageShell
      eyebrow="Légal"
      title="Politique de cookies"
      subtitle="Comment et pourquoi nous utilisons des cookies."
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
            1. Qu&apos;est-ce qu&apos;un cookie ?
          </h2>
          <p className="mb-4 leading-relaxed text-[#12100c]/70">
            Un cookie est un petit fichier texte stocké sur votre appareil lorsque
            vous visitez un site web. Les cookies permettent au site de mémoriser vos
            actions et préférences pendant une certaine période, évitant ainsi de
            devoir les ressaisir à chaque visite.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">
            2. Types de cookies utilisés
          </h2>

          <div className="mb-6">
            <h3 className="mb-3 text-xl font-semibold text-[#12100c]">
              Cookies essentiels
            </h3>
            <p className="mb-4 leading-relaxed text-[#12100c]/70">
              Ces cookies sont nécessaires au fonctionnement du site. Ils permettent
              des fonctionnalités de base comme la navigation et l&apos;accès aux
              zones sécurisées du site.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 text-xl font-semibold text-[#12100c]">
              Cookies de performance
            </h3>
            <p className="mb-4 leading-relaxed text-[#12100c]/70">
              Ces cookies collectent des informations sur la façon dont vous utilisez
              notre site, comme les pages que vous visitez le plus souvent. Ces
              données nous aident à améliorer le fonctionnement du site.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 text-xl font-semibold text-[#12100c]">
              Cookies de fonctionnalité
            </h3>
            <p className="mb-4 leading-relaxed text-[#12100c]/70">
              Ces cookies permettent au site de se souvenir de vos choix (comme votre
              langue ou votre région) et fournissent des fonctionnalités améliorées
              et personnalisées.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 text-xl font-semibold text-[#12100c]">
              Cookies marketing
            </h3>
            <p className="mb-4 leading-relaxed text-[#12100c]/70">
              Ces cookies sont utilisés pour vous montrer des publicités qui sont
              plus pertinentes pour vous et vos intérêts. Ils sont également utilisés
              pour limiter le nombre de fois que vous voyez une publicité.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">3. Gestion des cookies</h2>
          <p className="mb-4 leading-relaxed text-[#12100c]/70">
            Vous pouvez contrôler et/ou supprimer les cookies comme vous le
            souhaitez. Vous pouvez supprimer tous les cookies déjà présents sur votre
            ordinateur et configurer la plupart des navigateurs pour empêcher leur
            placement.
          </p>
          <p className="mb-4 leading-relaxed text-[#12100c]/70">
            Voici comment gérer les cookies dans les principaux navigateurs :
          </p>
          <ul className="ml-4 list-inside list-disc space-y-2 text-[#12100c]/70">
            <li>
              <strong>Chrome :</strong> Paramètres → Confidentialité et sécurité →
              Cookies
            </li>
            <li>
              <strong>Firefox :</strong> Options → Vie privée et sécurité → Cookies
            </li>
            <li>
              <strong>Safari :</strong> Préférences → Confidentialité → Cookies
            </li>
            <li>
              <strong>Edge :</strong> Paramètres → Confidentialité → Cookies
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">4. Cookies tiers</h2>
          <p className="mb-4 leading-relaxed text-[#12100c]/70">
            Certains cookies sont placés par des services tiers qui apparaissent sur
            nos pages. Nous n&apos;avons pas le contrôle sur ces cookies. Nous vous
            encourageons à consulter les politiques de cookies de ces services tiers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">5. Consentement</h2>
          <p className="mb-4 leading-relaxed text-[#12100c]/70">
            En continuant à utiliser notre site, vous acceptez l&apos;utilisation de
            cookies conformément à cette politique. Si vous n&apos;acceptez pas
            l&apos;utilisation de cookies, veuillez désactiver les cookies dans les
            paramètres de votre navigateur.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-[#12100c]">6. Contact</h2>
          <p className="leading-relaxed text-[#12100c]/70">
            Pour toute question concernant notre utilisation des cookies,
            contactez-nous à :{" "}
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

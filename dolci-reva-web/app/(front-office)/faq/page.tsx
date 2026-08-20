"use client";

import { useState } from "react";
import StaticPageShell from "@/components/sections/StaticPageShell";

const panel =
  "border border-[#12100c]/10 bg-white shadow-[0_20px_50px_-30px_rgba(18,16,12,0.45)]";
const cta =
  "inline-block bg-[#f08400] px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#d97400]";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Comment puis-je réserver un hébergement ?",
      answer:
        "Vous pouvez réserver directement sur notre site en sélectionnant votre destination, vos dates de séjour et en suivant les étapes de paiement sécurisé.",
    },
    {
      question: "Quels sont les moyens de paiement acceptés ?",
      answer:
        "Nous acceptons les cartes bancaires (Visa, Mastercard), les virements bancaires et les paiements mobiles. Tous les paiements sont sécurisés.",
    },
    {
      question: "Puis-je annuler ma réservation ?",
      answer:
        "Oui, vous pouvez annuler votre réservation gratuitement jusqu'à 48h avant la date d'arrivée. Après ce délai, des frais d'annulation peuvent s'appliquer selon les conditions de l'établissement.",
    },
    {
      question: "Comment puis-je modifier ma réservation ?",
      answer:
        "Vous pouvez modifier votre réservation en vous connectant à votre compte ou en nous contactant directement. Les modifications sont possibles jusqu'à 48h avant l'arrivée.",
    },
    {
      question: "Y a-t-il des frais de service ?",
      answer:
        "Non, Dolci Rêva n'applique aucun frais de service supplémentaire. Le prix affiché est le prix final que vous payez.",
    },
    {
      question: "Comment puis-je créer un compte ?",
      answer:
        "Cliquez sur 'S'inscrire' en haut à droite de la page, remplissez le formulaire avec vos informations et confirmez votre adresse email pour activer votre compte.",
    },
    {
      question: "Que faire si j'ai oublié mon mot de passe ?",
      answer:
        "Cliquez sur 'Mot de passe oublié' sur la page de connexion, entrez votre email et suivez les instructions envoyées par email pour réinitialiser votre mot de passe.",
    },
    {
      question: "Les prix incluent-ils les taxes ?",
      answer:
        "Oui, tous les prix affichés sur notre site incluent les taxes et frais applicables. Le prix que vous voyez est le prix final.",
    },
  ];

  return (
    <StaticPageShell
      eyebrow="Aide"
      title="Questions fréquentes"
      subtitle="Les réponses aux questions les plus courantes sur nos services."
      narrow
    >
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div key={faq.question} className={panel}>
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-[#faf8f5]"
            >
              <span className="pr-4 font-semibold text-[#12100c]">{faq.question}</span>
              <svg
                className={`h-5 w-5 shrink-0 text-[#f08400] transition-transform duration-300 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              className={`overflow-hidden px-6 transition-all duration-300 ${
                openIndex === index ? "max-h-96 pb-5" : "max-h-0"
              }`}
            >
              <p className="leading-relaxed text-[#12100c]/65">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={`${panel} mt-10 p-8 text-center lg:p-12`}>
        <h2 className="mb-4 text-2xl font-bold text-[#12100c]">
          Vous avez d&apos;autres questions ?
        </h2>
        <p className="mb-6 text-[#12100c]/65">
          Notre équipe est disponible pour vous aider. N&apos;hésitez pas à nous
          contacter.
        </p>
        <a href="mailto:contact@dolcireva.com" className={cta}>
          Nous contacter
        </a>
      </div>
    </StaticPageShell>
  );
}

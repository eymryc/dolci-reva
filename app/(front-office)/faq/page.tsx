"use client";

import { useState } from "react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Comment puis-je réserver un hébergement ?",
      answer: "Vous pouvez réserver directement sur notre site en sélectionnant votre destination, vos dates de séjour et en suivant les étapes de paiement sécurisé."
    },
    {
      question: "Quels sont les moyens de paiement acceptés ?",
      answer: "Nous acceptons les cartes bancaires (Visa, Mastercard), les virements bancaires et les paiements mobiles. Tous les paiements sont sécurisés."
    },
    {
      question: "Puis-je annuler ma réservation ?",
      answer: "Oui, vous pouvez annuler votre réservation gratuitement jusqu'à 48h avant la date d'arrivée. Après ce délai, des frais d'annulation peuvent s'appliquer selon les conditions de l'établissement."
    },
    {
      question: "Comment puis-je modifier ma réservation ?",
      answer: "Vous pouvez modifier votre réservation en vous connectant à votre compte ou en nous contactant directement. Les modifications sont possibles jusqu'à 48h avant l'arrivée."
    },
    {
      question: "Y a-t-il des frais de service ?",
      answer: "Non, Dolci Rêva n'applique aucun frais de service supplémentaire. Le prix affiché est le prix final que vous payez."
    },
    {
      question: "Comment puis-je créer un compte ?",
      answer: "Cliquez sur 'S'inscrire' en haut à droite de la page, remplissez le formulaire avec vos informations et confirmez votre adresse email pour activer votre compte."
    },
    {
      question: "Que faire si j'ai oublié mon mot de passe ?",
      answer: "Cliquez sur 'Mot de passe oublié' sur la page de connexion, entrez votre email et suivez les instructions envoyées par email pour réinitialiser votre mot de passe."
    },
    {
      question: "Les prix incluent-ils les taxes ?",
      answer: "Oui, tous les prix affichés sur notre site incluent les taxes et frais applicables. Le prix que vous voyez est le prix final."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <section className="relative py-20 lg:py-28 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-96 h-96 bg-theme-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-theme-accent rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 text-center">
              Questions fréquentes
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-theme-primary to-theme-accent mx-auto mb-12 rounded-full"></div>

            <p className="text-lg text-slate-600 leading-relaxed mb-12 text-center">
              Trouvez rapidement les réponses aux questions les plus courantes.
            </p>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-200/50 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                  >
                    <span className="font-semibold text-slate-900 pr-4">
                      {faq.question}
                    </span>
                    <svg
                      className={`w-5 h-5 text-theme-primary flex-shrink-0 transition-transform duration-300 ${
                        openIndex === index ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    className={`px-6 overflow-hidden transition-all duration-300 ${
                      openIndex === index ? "max-h-96 pb-5" : "max-h-0"
                    }`}
                  >
                    <p className="text-slate-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-12 shadow-lg border border-slate-200/50 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Vous avez d&apos;autres questions ?
              </h2>
              <p className="text-slate-600 mb-6">
                Notre équipe est disponible pour vous aider. N&apos;hésitez pas à nous contacter.
              </p>
              <a
                href="/contact"
                className="inline-block px-8 py-3 bg-gradient-to-r from-theme-primary to-theme-accent text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


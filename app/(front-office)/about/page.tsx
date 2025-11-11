import HeroSection from '@/components/sections/HeroSection';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <HeroSection
        title="À propos de nous"
        subtitle="Bienvenue chez Dolci Rêva, votre guide de confiance pour découvrir les trésors cachés de la Côte d'Ivoire"
        backgroundImage="/media/slide/slide3.jpg"
      />
      
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="w-24 h-1 bg-gradient-to-r from-theme-primary to-theme-accent mx-auto mb-12 rounded-full"></div>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-slate-600 leading-relaxed mb-8 text-center">
                Bienvenue chez Dolci Rêva, votre guide de confiance pour découvrir les trésors cachés de la Côte d&apos;Ivoire.
              </p>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-12 shadow-lg border border-slate-200/50 mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Notre Mission</h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Chez Dolci Rêva, nous nous engageons à vous offrir une expérience unique et mémorable en vous faisant découvrir les meilleurs hôtels, restaurants, lounges et circuits touristiques de la Côte d&apos;Ivoire. Notre mission est de promouvoir le tourisme local et de mettre en valeur la richesse culturelle et gastronomique de notre pays.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Nous croyons que chaque voyage devrait être une aventure extraordinaire, et nous sommes là pour vous guider à chaque étape de votre parcours.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-12 shadow-lg border border-slate-200/50 mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Notre Vision</h2>
                <p className="text-slate-600 leading-relaxed">
                  Devenir la plateforme de référence pour le tourisme en Côte d&apos;Ivoire, en offrant des expériences authentiques et de qualité qui célèbrent la diversité et la beauté de notre pays.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-12 shadow-lg border border-slate-200/50">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Nos Valeurs</h2>
                <ul className="space-y-4 text-slate-600">
                  <li className="flex items-start gap-3">
                    <span className="text-theme-primary font-bold text-xl">•</span>
                    <span><strong className="text-slate-900">Excellence :</strong> Nous nous efforçons de proposer uniquement les meilleures expériences à nos clients.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-theme-primary font-bold text-xl">•</span>
                    <span><strong className="text-slate-900">Authenticité :</strong> Nous mettons en avant la vraie culture ivoirienne et ses traditions.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-theme-primary font-bold text-xl">•</span>
                    <span><strong className="text-slate-900">Engagement :</strong> Nous sommes dédiés à offrir un service client exceptionnel.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-theme-primary font-bold text-xl">•</span>
                    <span><strong className="text-slate-900">Innovation :</strong> Nous utilisons la technologie pour améliorer votre expérience de voyage.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


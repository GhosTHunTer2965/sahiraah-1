
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-blue-50 min-h-[60vh] flex items-center">
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1470')" }}
        />
        <div className="container mx-auto px-4 py-10 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-blue-900">
              {t('index.heroTitle')}
            </h1>
            <p className="text-xl md:text-2xl text-blue-700 mb-6">
              {t('index.heroSubtitle')}
            </p>
            <Link to="/about">
              <Button className="text-lg px-6 py-5 bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold rounded-xl shadow-lg">
                {t('index.startJourney')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">{t('index.howItGuides')}</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-5 rounded-xl shadow">
              <div className="text-yellow-500 text-4xl font-bold mb-2">01</div>
              <h3 className="text-xl font-bold mb-2 text-blue-800">{t('index.step1Title')}</h3>
              <p className="text-blue-700">{t('index.step1Desc')}</p>
            </div>
            
            <div className="bg-blue-50 p-5 rounded-xl shadow">
              <div className="text-yellow-500 text-4xl font-bold mb-2">02</div>
              <h3 className="text-xl font-bold mb-2 text-blue-800">{t('index.step2Title')}</h3>
              <p className="text-blue-700">{t('index.step2Desc')}</p>
            </div>
            
            <div className="bg-blue-50 p-5 rounded-xl shadow">
              <div className="text-yellow-500 text-4xl font-bold mb-2">03</div>
              <h3 className="text-xl font-bold mb-2 text-blue-800">{t('index.step3Title')}</h3>
              <p className="text-blue-700">{t('index.step3Desc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-10 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">{t('index.successStories')}</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl shadow">
              <p className="italic text-blue-700 mb-3">"{t('index.testimonial1')}"</p>
              <p className="font-bold text-blue-900">{t('index.testimonial1Author')}</p>
            </div>
            
            <div className="bg-white p-5 rounded-xl shadow">
              <p className="italic text-blue-700 mb-3">"{t('index.testimonial2')}"</p>
              <p className="font-bold text-blue-900">{t('index.testimonial2Author')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-10 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('index.ctaTitle')}</h2>
          <p className="text-xl mb-6 max-w-2xl mx-auto">{t('index.ctaDesc')}</p>
          <Link to="/login">
            <Button className="text-lg px-6 py-5 bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold rounded-xl shadow-lg">
              {t('index.getStarted')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;


import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-blue-50 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-900">{t('about.title')}</h1>
          <div className="max-w-3xl">
            <p className="text-xl text-blue-700 mb-3">{t('about.intro1')}</p>
            <p className="text-xl text-blue-700">{t('about.intro2')}</p>
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-4 text-blue-900">{t('about.missionTitle')}</h2>
              <p className="text-lg text-blue-700 mb-3">{t('about.mission1')}</p>
              <p className="text-lg text-blue-700 mb-4">{t('about.mission2')}</p>
              <Link to="/login">
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold">
                  {t('about.joinToday')}
                </Button>
              </Link>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1470" 
                alt="Students exploring different career paths" 
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-10 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">{t('about.howItWorks')}</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl shadow text-center">
              <div className="bg-blue-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-900">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-blue-800">{t('about.step1Title')}</h3>
              <p className="text-blue-700">{t('about.step1Desc')}</p>
            </div>
            
            <div className="bg-white p-5 rounded-xl shadow text-center">
              <div className="bg-blue-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-900">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-blue-800">{t('about.step2Title')}</h3>
              <p className="text-blue-700">{t('about.step2Desc')}</p>
            </div>
            
            <div className="bg-white p-5 rounded-xl shadow text-center">
              <div className="bg-blue-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-900">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-blue-800">{t('about.step3Title')}</h3>
              <p className="text-blue-700">{t('about.step3Desc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">{t('about.teamTitle')}</h2>
          
          <div className="flex flex-wrap justify-center gap-6">
            <div className="bg-blue-50 p-5 rounded-xl shadow text-center w-full md:w-72">
              <div className="mx-auto mb-3 w-24 h-24 rounded-full overflow-hidden border-4 border-blue-200">
                <Avatar className="w-full h-full">
                  <AvatarImage src="/lovable-uploads/6b9157fa-c88d-488f-99b9-9f5fb09bc314.png" alt="Hrithik MP" className="object-cover" />
                  <AvatarFallback>HM</AvatarFallback>
                </Avatar>
              </div>
              <h3 className="text-xl font-bold mb-1 text-blue-800">Hrithik MP</h3>
              <p className="text-blue-700">Founder & CEO</p>
            </div>
            
            <div className="bg-blue-50 p-5 rounded-xl shadow text-center w-full md:w-72">
              <div className="mx-auto mb-3 w-24 h-24 rounded-full overflow-hidden border-4 border-blue-200">
                <Avatar className="w-full h-full">
                  <AvatarImage src="/lovable-uploads/36906fe3-2a3f-466d-8e86-53460799efd2.png" alt="Nithish Kumar B" className="object-cover" />
                  <AvatarFallback>NK</AvatarFallback>
                </Avatar>
              </div>
              <h3 className="text-xl font-bold mb-1 text-blue-800">Nithish Kumar B</h3>
              <p className="text-blue-700">Cloud Engineer</p>
            </div>
            
            <div className="bg-blue-50 p-5 rounded-xl shadow text-center w-full md:w-72">
              <div className="mx-auto mb-3 w-24 h-24 rounded-full overflow-hidden border-4 border-blue-200">
                <Avatar className="w-full h-full">
                  <AvatarImage src="/lovable-uploads/a76bcec3-8df6-42e8-9c30-98a61df2ba76.png" alt="H Adithya Rao" className="object-cover" />
                  <AvatarFallback>AR</AvatarFallback>
                </Avatar>
              </div>
              <h3 className="text-xl font-bold mb-1 text-blue-800">H Adithya Rao</h3>
              <p className="text-blue-700">Co-founder & Product Lead</p>
            </div>

            <div className="bg-blue-50 p-5 rounded-xl shadow text-center w-full md:w-72">
              <div className="mx-auto mb-3 w-24 h-24 rounded-full overflow-hidden border-4 border-blue-200">
                <Avatar className="w-full h-full">
                  <AvatarFallback className="text-2xl font-bold text-blue-800 bg-blue-100">NA</AvatarFallback>
                </Avatar>
              </div>
              <h3 className="text-xl font-bold mb-1 text-blue-800">Nayan Ajay</h3>
              <p className="text-blue-700">Chief Technical Officer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

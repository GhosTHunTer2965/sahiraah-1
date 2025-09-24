
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AdBanner from "@/components/AdBanner";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-blue-50 min-h-[60vh] flex items-center">
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1470')" }}
        />
        <div className="container mx-auto px-4 py-10 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-blue-900">
              Find Your Right Path with SahiRaah
            </h1>
            <p className="text-xl md:text-2xl text-blue-700 mb-6">
              AI-powered career guidance tailored to your interests and learning style
            </p>
            <Link to="/about">
              <Button className="text-lg px-6 py-5 bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold rounded-xl shadow-lg">
                Start Your Journey
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Strategic Ad Placement - Top Leaderboard */}
      <AdBanner size="leaderboard" className="bg-gray-50 py-4" />

      {/* Features Section */}
      <div className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">How SahiRaah Guides You</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-5 rounded-xl shadow">
              <div className="text-yellow-500 text-4xl font-bold mb-2">01</div>
              <h3 className="text-xl font-bold mb-2 text-blue-800">Discover Your Strengths</h3>
              <p className="text-blue-700">Answer questions about your interests, skills, and learning style.</p>
            </div>
            
            <div className="bg-blue-50 p-5 rounded-xl shadow">
              <div className="text-yellow-500 text-4xl font-bold mb-2">02</div>
              <h3 className="text-xl font-bold mb-2 text-blue-800">AI Analysis</h3>
              <p className="text-blue-700">Our AI analyzes your responses to match you with suitable career paths.</p>
            </div>
            
            <div className="bg-blue-50 p-5 rounded-xl shadow">
              <div className="text-yellow-500 text-4xl font-bold mb-2">03</div>
              <h3 className="text-xl font-bold mb-2 text-blue-800">Explore Careers</h3>
              <p className="text-blue-700">Get personalized career recommendations and resources to explore them further.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mid-Content Ad - Large Rectangle positioned naturally */}
      <div className="py-6 bg-blue-50 flex justify-center">
        <AdBanner size="large-rectangle" />
      </div>

      {/* Testimonials Section */}
      <div className="py-10 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">Student Success Stories</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl shadow">
              <p className="italic text-blue-700 mb-3">"SahiRaah helped me discover my passion for digital design when I was considering engineering because everyone else was. Now I'm pursuing a career I truly love."</p>
              <p className="font-bold text-blue-900">- Priya, Delhi</p>
            </div>
            
            <div className="bg-white p-5 rounded-xl shadow">
              <p className="italic text-blue-700 mb-3">"I was stuck between medicine and research. SahiRaah showed me career paths I didn't even know existed, and now I'm studying bioinformatics!"</p>
              <p className="font-bold text-blue-900">- Rahul, Mumbai</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-10 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Path?</h2>
          <p className="text-xl mb-6 max-w-2xl mx-auto">Join thousands of students who have discovered careers that match their true potential with SahiRaah.</p>
          <Link to="/login">
            <Button className="text-lg px-6 py-5 bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold rounded-xl shadow-lg">
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Bottom Ad - Leaderboard */}
      <AdBanner size="leaderboard" className="bg-white py-4" />
    </div>
  );
};

export default Index;

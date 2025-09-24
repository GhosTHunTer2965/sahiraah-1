
import { Link } from "react-router-dom";
import AdSenseAd from "@/components/AdSenseAd";

const Terms = () => {
  return (
    <div className="min-h-screen py-6 bg-blue-50">
      <div className="container mx-auto px-4 py-4">
        <div className="bg-white rounded-lg shadow-md p-5 md:p-6">
          <h1 className="text-3xl font-bold mb-4 text-blue-900">Terms & Conditions – SahiRaah</h1>
          <p className="text-gray-600 mb-4">Effective Date: 17/05/2025</p>
          
          <AdSenseAd adSlot="1234567890" className="mb-4" />
          
          <p className="mb-4">Welcome to SahiRaah. By using this platform, you agree to the following terms:</p>
          
          <div className="space-y-4">
            <section>
              <h2 className="text-xl font-bold text-blue-800 mb-1">1. Purpose of Use</h2>
              <p>SahiRaah is designed to provide career guidance based on your inputs and responses to our assessment questions. All results and suggestions are educational and informational in nature. The platform creates personalized recommendations based on your specific inputs and profile.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-blue-800 mb-1">2. User Accounts</h2>
              <p>When you create an account on SahiRaah, we collect and store information including your email address and other optional profile details. You are responsible for maintaining the confidentiality of your account login information. Each user account is personal and individual, and your recommendations are based on your specific inputs. You may access your account through email/password login or through authorized social login providers.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-blue-800 mb-1">3. No Professional Guarantee</h2>
              <p>Career recommendations are AI-generated and informational. We provide tailored guidance based on your responses, but we do not guarantee job placement or academic success. Results are meant to be educational resources for your consideration.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-blue-800 mb-1">4. User Responsibility</h2>
              <p>You are responsible for your decisions based on guidance provided by SahiRaah. We encourage discussing options with a real counselor or guardian. The platform stores your quiz responses and recommendations for your future reference, but it is your responsibility to make informed decisions.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-blue-800 mb-1">5. Data Usage</h2>
              <p>We collect and store your answers and interactions securely in Supabase under your user account. Your data is private and used to improve your personal recommendations. See our <Link to="/privacy" className="text-blue-700 hover:text-blue-900">Privacy Policy</Link> for full details.</p>
            </section>
            
            <AdSenseAd adSlot="1234567890" className="my-4" />
            
            <section>
              <h2 className="text-xl font-bold text-blue-800 mb-1">6. Content Ownership</h2>
              <p>All platform content (text, graphics, AI logic) is owned by SahiRaah. You may not copy or redistribute without permission. Your personal data and responses remain yours, but the recommendations generated are the intellectual property of SahiRaah.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-blue-800 mb-1">7. User-Generated Content</h2>
              <p>By submitting responses to our platform, you grant us the right to process and analyze this data to provide you with personalized recommendations. You retain ownership of your personal information and can request its deletion at any time.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-blue-800 mb-1">8. Account Termination</h2>
              <p>We reserve the right to terminate or suspend your account at our discretion, particularly if we detect misuse or violation of these terms. You may also delete your account at any time through your profile settings.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-blue-800 mb-1">9. Modification and Updates</h2>
              <p>We may change these terms at any time. Continued use means you agree to any updated terms. We will notify users of significant changes to these terms.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-blue-800 mb-1">10. Limitation of Liability</h2>
              <p>SahiRaah and its operators are not liable for any decisions made based on the platform's recommendations or for any inaccuracies in the content provided.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-blue-800 mb-1">11. Contact</h2>
              <p>For concerns or suggestions, email us at: <a href="mailto:support@sahiraah.in" className="text-blue-700 hover:text-blue-900">support@sahiraah.in</a></p>
            </section>
          </div>
          
          <div className="mt-6 text-center">
            <Link to="/" className="text-blue-700 hover:text-blue-900 font-medium">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;

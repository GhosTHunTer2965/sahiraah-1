
import { Link } from "react-router-dom";
import AdSenseAd from "@/components/AdSenseAd";

const Privacy = () => {
  return (
    <div className="min-h-screen py-6 bg-blue-50">
      <div className="container mx-auto px-4 py-4">
        <div className="bg-white rounded-lg shadow-md p-5 md:p-6">
          <h1 className="text-3xl font-bold mb-4 text-blue-900">Privacy Policy – SahiRaah</h1>
          <p className="text-gray-600 mb-4">Effective Date: 17/05/2025</p>
          
          <AdSenseAd adSlot="1234567890" className="mb-4" />
          
          <p className="mb-4">We take your privacy seriously. Here's how your data is handled:</p>
          
          <div className="space-y-4">
            <section>
              <h2 className="text-xl font-bold text-blue-800 mb-1">What We Collect</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your quiz answers</li>
                <li>Email and authentication data (if you create an account)</li>
                <li>Name and other profile information you provide</li>
                <li>Basic interaction data (to improve recommendations)</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-blue-800 mb-1">Why We Collect It</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>To give personalized career suggestions based on your responses</li>
                <li>To save your career history and recommendations for future reference</li>
                <li>To improve the platform's accuracy and relevance</li>
                <li>To provide support if needed</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-blue-800 mb-1">User-Specific Data</h2>
              <p>All your quiz answers, career recommendations, and history are stored securely and tied specifically to your user account. Your data is kept private and is not shared with other users. Each user receives personalized recommendations based on their own responses.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-blue-800 mb-1">Data Storage</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>All data is securely stored using Supabase cloud services with industry-standard encryption.</li>
                <li>We implement strict access controls to protect your information.</li>
                <li>We do not sell or share your personal data with advertisers or third parties.</li>
              </ul>
            </section>
            
            <AdSenseAd adSlot="1234567890" className="my-4" />
            
            <section>
              <h2 className="text-xl font-bold text-blue-800 mb-1">Social Login</h2>
              <p>When you choose to sign in using social login options (Google, Facebook, or Yahoo), we receive basic profile information from those providers. We only use this information to create and authenticate your account. We do not post to your social media accounts or access your contacts without explicit permission.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-blue-800 mb-1">Cookies</h2>
              <p>We use minimal cookies for improving performance and remembering your session. These are necessary for the proper functioning of our service.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-blue-800 mb-1">Data Access and Deletion</h2>
              <p>You may request access to your data or ask for deletion by contacting <a href="mailto:support@sahiraah.in" className="text-blue-700 hover:text-blue-900">support@sahiraah.in</a>. You can also delete your account directly from your profile settings.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-blue-800 mb-1">Children Under 13</h2>
              <p>SahiRaah is intended for users aged 13 and above. Parental guidance is advised for younger users.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-blue-800 mb-1">Security</h2>
              <p>We follow industry-standard measures to protect your information including encryption, secure application design, and regular security audits.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-800 mb-1">Updates to Privacy Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the effective date.</p>
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

export default Privacy;

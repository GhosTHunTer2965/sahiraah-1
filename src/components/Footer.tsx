
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-blue-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Sahi<span className="text-yellow-500">Raah</span></h3>
            <p className="text-blue-200 mb-4">
              {t('footer.tagline')}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-blue-200 hover:text-yellow-500">{t('footer.home')}</Link></li>
              <li><Link to="/about" className="text-blue-200 hover:text-yellow-500">{t('nav.about')}</Link></li>
              <li><Link to="/contact" className="text-blue-200 hover:text-yellow-500">{t('nav.contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">{t('footer.contactLegal')}</h4>
            <ul className="space-y-2">
              <li><a href="mailto:support@sahiraah.in" className="text-blue-200 hover:text-yellow-500">support@sahiraah.in</a></li>
              <li><Link to="/terms" className="text-blue-200 hover:text-yellow-500">{t('footer.terms')}</Link></li>
              <li><Link to="/privacy" className="text-blue-200 hover:text-yellow-500">{t('footer.privacy')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-200">
          <p>&copy; {new Date().getFullYear()} {t('footer.allRights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
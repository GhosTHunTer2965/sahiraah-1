
import { useEffect, useRef } from 'react';

interface AdSenseAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  style?: React.CSSProperties;
  className?: string;
  educationalCategory?: 'courses' | 'career' | 'skills' | 'general';
}

const AdSenseAd: React.FC<AdSenseAdProps> = ({
  adSlot,
  adFormat = 'auto',
  style = { display: 'block', textAlign: 'center' },
  className,
  educationalCategory = 'general',
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    try {
      if (adRef.current && typeof window !== 'undefined') {
        // Check if AdSense script is loaded
        if (window.adsbygoogle) {
          // Push the ad with educational targeting
          (window.adsbygoogle = window.adsbygoogle || []).push({
            // Add educational targeting parameters
            google_ad_channel: `education,career,${educationalCategory}`,
            google_ad_region: 'educational_content'
          });
          console.log(`Educational AdSense ad pushed for category: ${educationalCategory}`);
        } else {
          console.log("AdSense not loaded yet");
        }
      }
    } catch (error) {
      console.error("Error loading AdSense ad:", error);
    }
  }, [educationalCategory]);

  const getCategoryKeywords = (category: string) => {
    const keywords = {
      courses: 'online courses, education, learning, certification',
      career: 'career development, job opportunities, professional growth',
      skills: 'skill development, training, professional skills',
      general: 'education, learning, career, development'
    };
    return keywords[category as keyof typeof keywords] || keywords.general;
  };

  return (
    <div className={`adsense-container ${className || ''}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-7107600695656638"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
        data-ad-channel={`education,career,${educationalCategory}`}
        data-page-url={window.location.href}
        data-ad-keywords={getCategoryKeywords(educationalCategory)}
      />
    </div>
  );
};

// Add global type for window adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default AdSenseAd;

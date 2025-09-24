
import React from 'react';
import AdSenseAd from './AdSenseAd';

interface AdBannerProps {
  size: 'leaderboard' | 'large-rectangle'; // 728x90 or 300x250
  className?: string;
  educationalCategory?: 'courses' | 'career' | 'skills' | 'general';
}

const AdBanner: React.FC<AdBannerProps> = ({ 
  size, 
  className, 
  educationalCategory = 'career' 
}) => {
  // Set dimensions and ad slots based on size
  const adConfig = size === 'leaderboard' 
    ? { 
        maxWidth: '728px', 
        height: '90px',
        adSlot: '1234567890', // Replace with your leaderboard ad slot
        adFormat: 'horizontal' as const
      } 
    : { 
        maxWidth: '300px', 
        height: '250px',
        adSlot: '0987654321', // Replace with your rectangle ad slot
        adFormat: 'rectangle' as const
      };

  const fallbackContent = {
    courses: {
      title: "Featured Educational Courses",
      description: "Discover top-rated online courses and certifications"
    },
    career: {
      title: "Career Development Resources",
      description: "Professional growth opportunities and career guidance"
    },
    skills: {
      title: "Skill Building Programs",
      description: "Essential skills for your professional development"
    },
    general: {
      title: "Educational Resources",
      description: "Learning opportunities for career advancement"
    }
  };

  const content = fallbackContent[educationalCategory];
  
  return (
    <div className={`relative w-full flex justify-center my-4 ${className}`}>
      <div 
        className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
        style={{ 
          width: '100%', 
          maxWidth: adConfig.maxWidth, 
          minHeight: adConfig.height 
        }}
      >
        {/* AdSense Ad */}
        <AdSenseAd
          adSlot={adConfig.adSlot}
          adFormat={adConfig.adFormat}
          educationalCategory={educationalCategory}
          style={{ display: 'block', width: '100%', height: '100%' }}
        />
        
        {/* Fallback Educational Content */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="text-center p-4">
            <div className="mb-2">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full uppercase tracking-wide">
                Educational Content
              </span>
            </div>
            <h4 className="text-sm font-bold text-blue-900 mb-1">{content.title}</h4>
            <p className="text-xs text-blue-700 leading-tight">{content.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdBanner;

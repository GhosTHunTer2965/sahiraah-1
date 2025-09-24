// Google AdSense integration script for SahiRaah
(function() {
  // Check if AdSense script is already loaded
  if (window.adsbygoogle) {
    return;
  }

  // Create and load AdSense script
  const adsenseScript = document.createElement('script');
  adsenseScript.async = true;
  adsenseScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7107600695656638';
  adsenseScript.crossOrigin = 'anonymous';
  
  // Add to head
  document.head.appendChild(adsenseScript);
  
  // Initialize adsbygoogle array
  window.adsbygoogle = window.adsbygoogle || [];
  
  console.log('Google AdSense script loaded for SahiRaah');
})();
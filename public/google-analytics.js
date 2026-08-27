(function initializeGoogleAnalytics() {
  const productionHosts = new Set(["leaguenightpro.com", "www.leaguenightpro.com"]);
  if (!productionHosts.has(window.location.hostname.toLowerCase())) {
    return;
  }

  window.dataLayer = window.dataLayer || [];

  function gtag() {
    window.dataLayer.push(arguments);
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-BX9JRRYPQY";
  document.head.appendChild(script);

  gtag("js", new Date());
  gtag("config", "G-BX9JRRYPQY");
})();

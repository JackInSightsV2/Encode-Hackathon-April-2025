// This file is not used in production
// next-offline handles service worker registration in production

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service-worker.js').then(
      function(registration) {
        console.log('Service Worker registration successful with scope: ', registration.scope);
      },
      function(err) {
        console.log('Service Worker registration failed: ', err);
      }
    );
  });
} 
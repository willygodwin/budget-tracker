// const FILES_TO_CACHE = [
//   '/',
//   '/index.html',
//   '/styles.css',
//   '/index.js',
//   '/icons/icon-192x192.png',
//   '/icons/icon-512x512.png',
//   '/db.js',
//   'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
//   'https://cdn.jsdelivr.net/npm/chart.js@2.8.0'
// ];

// const PRECACHE = 'precache-v1';
// const RUNTIME = 'runtime';

// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches
//       .open(PRECACHE)
//       .then((cache) => cache.addAll(FILES_TO_CACHE))
//       .then(self.skipWaiting())
//   );
// });

// // The activate handler takes care of cleaning up old caches.
// self.addEventListener('activate', (event) => {
//   const currentCaches = [PRECACHE, RUNTIME];
//   event.waitUntil(
//     caches
//       .keys()
//       .then((cacheNames) => {
//         return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
//       })
//       .then((cachesToDelete) => {
//         return Promise.all(
//           cachesToDelete.map((cacheToDelete) => {
//             return caches.delete(cacheToDelete);
//           })
//         );
//       })
//       .then(() => self.clients.claim())
//   );
// });

// the cache version gets updated every time there is a new deployment
const CACHE_VERSION = 10;
const CURRENT_CACHE = `main-${CACHE_VERSION}`;

// these are the routes we are going to cache for offline support
const cacheFiles = [
  '/',
  '/index.html',
  '/styles.css',
  '/index.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/db.js',
  'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js@2.8.0'
];


// on activation we clean up the previously registered service workers
self.addEventListener('activate', evt =>
  evt.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CURRENT_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  )
);

// on install we download the routes we want to cache for offline
self.addEventListener('install', evt =>
  evt.waitUntil(
    caches.open(CURRENT_CACHE).then(cache => {
      return cache.addAll(cacheFiles);
    })
  )
);



// fetch the resource from the network
const fromNetwork = (request, timeout) =>
  new Promise((fulfill, reject) => {
    const timeoutId = setTimeout(reject, timeout);
    fetch(request).then(response => {
      clearTimeout(timeoutId);
      fulfill(response);
      update(request);
    }, reject);
  });

// fetch the resource from the browser cache
const fromCache = request =>
  caches
    .open(CURRENT_CACHE)
    .then(cache =>
      cache
        .match(request)
        .then(matching => matching || cache.match('/offline/'))
    );

// cache the current page to make it available for offline
const update = request =>
  caches
    .open(CURRENT_CACHE)
    .then(cache =>
      fetch(request).then(response => cache.put(request, response))
    );



// general strategy when making a request (eg if online try to fetch it
// from the network with a timeout, if something fails serve from cache)
self.addEventListener('fetch', evt => {
  evt.respondWith(
    fromNetwork(evt.request, 10000).catch(() => fromCache(evt.request))
  );
  evt.waitUntil(update(evt.request));
});


// self.addEventListener('fetch', (event) => {



//   console.log(self.location.origin);

//   // if (event.request.url.startsWith(self.location.origin)) {

//   // network first

//   // relay to fetch

//   // overwrite existing cache & return response

//   // if failed, find in cache
//   if (true) {
//     event.respondWith(

//       fetch(event.request)
//         .then(response => {
//           if(event.request.method === 'GET'){
//             return caches.open(PRECACHE).then((cache) => {
//               return cache.put(event.request, response.clone())
//               .then(() => {
//                 return response;
//               });
//             });
//           }
//         })
//         .catch((err) => {
//           return caches.match(event.request).then((cachedResponse) => {
//             if (cachedResponse) {
//               return cachedResponse;
//             }
//             throw err;
//         })
    
      
        

      
//         // return caches.open(RUNTIME).then((cache) => {
//         //   return fetch(event.request)
//         //     .then((response) => {
//         //       if(event.request.method !== 'GET'){
//         //         return response;
//         //       }
//         //       return cache.put(event.request, response.clone())
//         //         .then(() => {
//         //           return response;
//         //         });
//         //     })
//         // });
//       })
//     );
//   }
// });

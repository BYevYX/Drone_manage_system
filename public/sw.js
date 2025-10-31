const CACHE_NAME = 'drone-agro-v1';
const STATIC_CACHE_NAME = 'drone-agro-static-v1';
const DYNAMIC_CACHE_NAME = 'drone-agro-dynamic-v1';

// Файлы для кеширования при установке
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/fonts/nekst/Nekst-Regular.woff2',
  '/fonts/nekst/Nekst-Medium.woff2',
  '/fonts/nekst/Nekst-SemiBold.woff2',
  '/fonts/poppins/Poppins-Regular.ttf',
  '/fonts/poppins/Poppins-Medium.ttf',
];

// API эндпоинты для кеширования
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.droneagro\.ru\/v1\/drones/,
  /^https:\/\/api\.droneagro\.ru\/v1\/fields/,
  /^https:\/\/api\.droneagro\.ru\/v1\/requests/,
];

// Стратегии кеширования
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
};

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Удаляем старые кеши
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith('drone-agro-')) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// Обработка fetch запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Игнорируем запросы к chrome-extension и другим протоколам
  if (!request.url.startsWith('http')) {
    return;
  }

  // Определяем стратегию кеширования
  let strategy = CACHE_STRATEGIES.NETWORK_FIRST;

  if (isStaticAsset(request)) {
    strategy = CACHE_STRATEGIES.CACHE_FIRST;
  } else if (isApiRequest(request)) {
    strategy = CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  } else if (isImageRequest(request)) {
    strategy = CACHE_STRATEGIES.CACHE_FIRST;
  }

  event.respondWith(handleRequest(request, strategy));
});

// Проверка типов запросов
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|woff2?|ttf|eot|ico|png|jpg|jpeg|gif|svg)$/);
}

function isApiRequest(request) {
  const url = new URL(request.url);
  return API_CACHE_PATTERNS.some(pattern => pattern.test(request.url)) ||
         url.pathname.startsWith('/api/');
}

function isImageRequest(request) {
  return request.destination === 'image';
}

// Обработка запросов с разными стратегиями
async function handleRequest(request, strategy) {
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request);
    
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request);
    
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request);
    
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request);
    
    case CACHE_STRATEGIES.CACHE_ONLY:
      return caches.match(request);
    
    default:
      return networkFirst(request);
  }
}

// Стратегия Cache First
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(getCacheName(request));
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache First: Network request failed', error);
    
    // Возвращаем офлайн страницу для навигационных запросов
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response('Offline');
    }
    
    throw error;
  }
}

// Стратегия Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(getCacheName(request));
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network First: Network failed, trying cache', error);
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Возвращаем офлайн страницу для навигационных запросов
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response('Offline');
    }
    
    throw error;
  }
}

// Стратегия Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const networkResponsePromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        const cache = caches.open(getCacheName(request));
        cache.then(c => c.put(request, networkResponse.clone()));
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('Stale While Revalidate: Network update failed', error);
    });

  return cachedResponse || networkResponsePromise;
}

// Определение имени кеша
function getCacheName(request) {
  if (isStaticAsset(request)) {
    return STATIC_CACHE_NAME;
  }
  return DYNAMIC_CACHE_NAME;
}

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
    
    case 'CLEAR_CACHE':
      clearCache(payload?.cacheName);
      break;
    
    case 'PREFETCH_URLS':
      prefetchUrls(payload?.urls || []);
      break;
  }
});

// Очистка кеша
async function clearCache(cacheName) {
  if (cacheName) {
    await caches.delete(cacheName);
  } else {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(name => caches.delete(name))
    );
  }
}

// Предварительная загрузка URL
async function prefetchUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  
  await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.error('Prefetch failed for', url, error);
      }
    })
  );
}

// Обработка push уведомлений
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data,
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const { action, data } = event;
  let url = data?.url || '/';

  if (action) {
    url = data?.actions?.[action]?.url || url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Ищем открытое окно с нужным URL
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Открываем новое окно
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Обработка синхронизации в фоне
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Здесь можно реализовать синхронизацию данных
  // например, отправку отложенных запросов
  console.log('Background sync triggered');
}
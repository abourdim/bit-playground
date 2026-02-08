// sw.js — Service Worker for micro:bit Playground PWA
const CACHE_NAME = 'microbit-playground-v2';
const ASSETS = [
    'index.html',
    'styles.css',
    'js/core.js',
    'js/ble.js',
    'js/sensors.js',
    'js/controls.js',
    'js/servos.js',
    'js/others.js',
    'js/graph.js',
    'logo.svg',
    'manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});

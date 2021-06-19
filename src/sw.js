// using service workers as a mock API, for funzies

let uid = 0;

const profiles = [
    {
        id: uid++,
        name: 'Randy Bobandy'

    },
    {
        id: uid++,
        name: 'Arthur Foibles'
    },
    {
        id: uid++,
        name: 'Ron Donlenson'
    }
];

globalThis.addEventListener('install', e => {
    globalThis.skipWaiting();
});

globalThis.addEventListener('fetch', e => {
    const url = new URL(e.request.url);
    if (e.request.method === 'GET' && url.pathname === '/api/profiles') {
        e.respondWith(new Response(JSON.stringify(profiles), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        }));
    }
});

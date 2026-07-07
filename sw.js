// このアプリを「ホーム画面に追加(インストール)」できるようにするための
// 最小限のサービスワーカーです。オフラインキャッシュ等は行いません。
self.addEventListener("install", (e) => { self.skipWaiting(); });
self.addEventListener("activate", (e) => { self.clients.claim(); });
self.addEventListener("fetch", (e) => { /* 素通し */ });

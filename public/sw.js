/* Kseerat Web Push Service Worker */
const CACHE = "kseerat-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("push", (event) => {
  let data = {
    title: "كسيرات | Kseerat",
    body: "لديك تحديث جديد من كسيرات",
    url: "/",
    icon: "/icons/icon-192.svg",
    badge: "/icons/icon-192.svg",
  };
  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (e) {
    try {
      data.body = event.data.text();
    } catch (_) {}
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || "/icons/icon-192.svg",
      badge: data.badge || "/icons/icon-192.svg",
      image: data.image || undefined,
      tag: data.tag || undefined,
      renotify: !!data.tag,
      data: { url: data.url || "/" },
      vibrate: [120, 60, 120],
      dir: "rtl",
      lang: "ar",
      actions: [{ action: "open", title: "فتح كسيرات" }],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clientList) {
        const url = new URL(client.url);
        if (url.origin === self.location.origin) {
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(target);
            } catch (_) {}
          }
          return;
        }
      }
      await self.clients.openWindow(target);
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

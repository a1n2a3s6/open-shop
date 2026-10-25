import webpush from "web-push";
import { prisma } from "./prisma";

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  image?: string;
  tag?: string;
};

type VapidKeys = { publicKey: string; privateKey: string };
let cachedKeys: VapidKeys | null = null;

export async function getVapidKeys(): Promise<VapidKeys> {
  if (cachedKeys) return cachedKeys;
  let publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
  let privateKey = process.env.VAPID_PRIVATE_KEY || "";
  if (!publicKey || !privateKey) {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    if (settings?.vapidPublicKey && settings.vapidPrivateKey) {
      publicKey = settings.vapidPublicKey;
      privateKey = settings.vapidPrivateKey;
    } else {
      const generated = webpush.generateVAPIDKeys();
      publicKey = generated.publicKey;
      privateKey = generated.privateKey;
      await prisma.siteSettings.upsert({
        where: { id: 1 },
        create: { id: 1, vapidPublicKey: publicKey, vapidPrivateKey: privateKey },
        update: { vapidPublicKey: publicKey, vapidPrivateKey: privateKey },
      });
    }
  }
  cachedKeys = { publicKey, privateKey };
  return cachedKeys;
}

type StoredSubscription = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function sendWebPush(subs: StoredSubscription[], payload: PushPayload) {
  if (!subs.length) return { sent: 0, failed: 0 };
  const keys = await getVapidKeys();
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:owner@kseerat.com",
    keys.publicKey,
    keys.privateKey
  );
  let sent = 0;
  let failed = 0;
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ ...payload, icon: "/icons/icon-192.svg", badge: "/icons/icon-192.svg" }),
          { TTL: 60 * 60 * 24 }
        );
        sent++;
      } catch (error: unknown) {
        failed++;
        const status = (error as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => undefined);
        }
      }
    })
  );
  return { sent, failed };
}

export async function sendPushToRole(role: "ADMIN" | "CUSTOMER", payload: PushPayload) {
  const subs = await prisma.pushSubscription.findMany({ where: { userRole: role } });
  return sendWebPush(subs, payload);
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subs.length) return sendWebPush(subs, payload);
  return { sent: 0, failed: 0 };
}

export async function notifyAdminNewOrder(order: {
  orderNumber: string;
  totalInSelectedCurrency: number;
  currencyCode: string;
  customerFirstName: string;
  customerLastName: string;
}) {
  const body = `طلب جديد #${order.orderNumber} من ${order.customerFirstName} ${order.customerLastName} بقيمة ${order.totalInSelectedCurrency.toFixed(2)} ${order.currencyCode}`;
  await prisma.notification.create({
    data: {
      title: "🔔 طلب جديد في كسيرات",
      body,
      url: `/admin?section=orders`,
      targetType: "ADMIN",
    },
  });
  await sendPushToRole("ADMIN", {
    title: "🔔 طلب جديد في كسيرات",
    body,
    url: "/admin?section=orders",
    tag: "new-order",
  });
}

export async function notifyCustomerStatus(
  order: { orderNumber: string; userId: string | null; paymentStatus: string },
  statusLabel: string
) {
  const payload: PushPayload = {
    title: `كسيرات | تحديث طلبك ${order.orderNumber}`,
    body: `حالة طلبك الآن: ${statusLabel}. شكراً لثقتك بكسيرات.`,
    url: `/order-success/${order.orderNumber}`,
    tag: `order-${order.orderNumber}`,
  };
  if (order.userId) {
    const res = await sendPushToUser(order.userId, payload);
    if (res.sent > 0) return res;
  }
  return sendPushToRole("CUSTOMER", payload);
}

export async function broadcastToCustomers(
  payload: PushPayload,
  log?: { targetType?: string; imageUrl?: string }
) {
  await prisma.notification.create({
    data: {
      title: payload.title,
      body: payload.body,
      url: payload.url,
      imageUrl: payload.image || log?.imageUrl,
      targetType: log?.targetType || "BROADCAST",
    },
  });
  return sendPushToRole("CUSTOMER", payload);
}

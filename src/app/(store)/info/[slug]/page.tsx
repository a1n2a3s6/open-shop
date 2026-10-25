import { notFound } from "next/navigation";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, ShieldCheck, Truck, RefreshCw, HelpCircle, MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type InfoContent = {
  titleAr: string;
  subtitleAr: string;
  content: React.ReactNode;
};

export default async function InfoPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });

  const pages: Record<string, InfoContent> = {
    story: {
      titleAr: "حكايتنا مع العطر والعود",
      subtitleAr: "أصالة التراث الكويتي وشغف الفخامة الخليجية",
      content: (
        <div className="space-y-6 text-sm leading-8 text-muted">
          <p className="font-quote text-xl leading-10 text-ink/90">
            «{settings?.storyQuoteAr || "في كسيرات، نؤمن أن العطر قصةٌ تُعاش، وذكرى تبقى، وإرثٌ يمتد عبر الأجيال."}»
          </p>
          <p>
            تأسست دار <strong>كسيرات (Kseerat)</strong> في دولة الكويت انطلاقاً من شغف عميق بتراث العطور العربية الأصيلة ودهن العود المعتق. بدأنا رحلتنا من أسواق الطيب القديمة، نبحث عن أنقى أنواع خشب العود في غابات كمبوديا وماليزيا والهند، لنستخلص منها أندر الزيوت العطرية.
          </p>
          <p>
            نحن نعتبر العطر بصمة شخصية لا تزول، ولذلك نحرص على انتقاء المكونات الطبيعية الفاخرة، ونمزجها بأحدث تقنيات التصنيع العالمية لنقدم لكل عميل في دول الخليج تجربة استثنائية تفوق التوقعات.
          </p>
          <div className="rounded-2xl border border-brand/20 bg-brand-light/40 p-6 text-ink">
            <h3 className="font-cairo text-base font-bold text-brand">وعد كسيرات</h3>
            <p className="mt-2 text-xs leading-6">
              نلتزم بضمان الأصالة 100% لكافة منتجاتنا، مع تقديم تجربة تسوق راقية وشحن فائق السرعة من قلب الكويت إلى باب بيتك في أي دولة خليجية.
            </p>
          </div>
        </div>
      ),
    },

    privacy: {
      titleAr: "سياسة الخصوصية وشروط الاستخدام",
      subtitleAr: "كيف نحمي بياناتك ونلتزم بأعلى معايير الأمان والشفافية",
      content: (
        <div className="space-y-6 text-sm leading-8 text-muted">
          <h3 className="font-cairo text-base font-bold text-ink">1. حماية البيانات الشخصية</h3>
          <p>
            تلتزم دار كسيرات بحماية خصوصية جميع زوار وعملاء متجرنا الإلكتروني. نقوم بجمع المعلومات اللازمة فقط لمعالجة طلباتكم وتوصيلها، مثل الاسم، رقم الهاتف، عنوان الشحن والبريد الإلكتروني.
          </p>
          <h3 className="font-cairo text-base font-bold text-ink">2. المعاملات المالية والدفع</h3>
          <p>
            تتم جميع المدفوعات عبر بوابات مشفرة ومعتمدة (بوابة MyFatoorah / KNET)، ولا نقوم إطلاقاً بتخزين بيانات بطاقاتكم الائتمانية أو أرقام الحسابات السرية على خوادمنا.
          </p>
          <h3 className="font-cairo text-base font-bold text-ink">3. حقوق العميل</h3>
          <p>
            يحق للعميل طلب تعديل بياناته أو حذف حسابه في أي وقت بالتواصل مع خدمة العملاء.
          </p>
        </div>
      ),
    },

    shipping: {
      titleAr: "سياسة الشحن والاستبدال والاسترجاع",
      subtitleAr: "شحن سريع لجميع دول الخليج مع سياسة استبدال مرنة وضمان الجودة",
      content: (
        <div className="space-y-6 text-sm leading-8 text-muted">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card">
              <Truck size={24} className="text-brand" />
              <h3 className="mt-3 font-cairo text-sm font-bold text-ink">مدة التوصيل</h3>
              <p className="mt-1 text-xs leading-6">
                - داخل الكويت: خلال 24 - 48 ساعة.<br />
                - دول الخليج (السعودية، الإمارات، قطر، البحرين، عمان): خلال 3 - 6 أيام عمل عبر شركات الشحن السريع.
              </p>
            </div>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card">
              <RefreshCw size={24} className="text-brand" />
              <h3 className="mt-3 font-cairo text-sm font-bold text-ink">الاستبدال والاسترجاع</h3>
              <p className="mt-1 text-xs leading-6">
                يحق لكم استبدال أو استرجاع المنتجات خلال 7 أيام من تاريخ الاستلام، بشرط أن يكون المنتج بحالته الأصلية ومغلفاً بالعلبة الأصلية ولم يتم فتحه أو استخدامه لأسباب صحية وتتعلق بسلامة العطور.
              </p>
            </div>
          </div>
        </div>
      ),
    },

    faq: {
      titleAr: "الأسئلة الشائعة (FAQ)",
      subtitleAr: "إجابات على الأسئلة الأكثر تداولاً من عملاء كسيرات",
      content: (
        <div className="space-y-4">
          {[
            {
              q: "هل عطور ودهن عود كسيرات أصلية وطبيعية؟",
              a: "نعم 100%. نحرص على استيراد أفخر أنواع خشب العود والزيوت العطرية الطبيعية ونقدم شهادة ضمان الأصالة مع كل طلب.",
            },
            {
              q: "ما هي الدول التي تقومون بالشحن إليها؟",
              a: "نشحن من مقرنا الرئيسي في الكويت إلى جميع دول مجلس التعاون الخليجي: الكويت، السعودية، الإمارات، قطر، البحرين، وسلطنة عمان.",
            },
            {
              q: "كيف يمكنني الحصول على شحن مجاني؟",
              a: "تحصل على شحن مجاني تلقائياً عندما يتجاوز طلبك الحد الأدنى المحدد لعملة دولتك في المتجر.",
            },
            {
              q: "ما هي طرق الدفع المتاحة؟",
              a: "نوفر الدفع عبر KNET، Apple Pay، Visa، Mastercard، والدفع عند الاستلام (COD) داخل الكويت وبعض مناطق الخليج.",
            },
            {
              q: "كيف أتتبع شحنتي؟",
              a: "يمكنك إدخال رقم الطلب في صفحة تتبع الطلب من القائمة السفلية لمعرفة خط سير الشحنة لحظة بلحظة.",
            },
          ].map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card">
              <p className="font-cairo text-sm font-bold text-ink">{item.q}</p>
              <p className="mt-2 text-xs leading-6 text-muted">{item.a}</p>
            </div>
          ))}
        </div>
      ),
    },

    contact: {
      titleAr: "تواصل معنا",
      subtitleAr: "فريق خدمة عملاء كسيرات في خدمتكم على مدار الساعة",
      content: (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-black/[0.06] bg-white p-5 text-center shadow-card">
              <Phone size={24} className="mx-auto text-brand" />
              <h3 className="mt-3 font-cairo text-sm font-bold text-ink">الهاتف</h3>
              <p className="mt-1 text-xs font-bold text-brand" dir="ltr">
                {settings?.phone || "+965 2222 8888"}
              </p>
            </div>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-5 text-center shadow-card">
              <Mail size={24} className="mx-auto text-brand" />
              <h3 className="mt-3 font-cairo text-sm font-bold text-ink">البريد الإلكتروني</h3>
              <p className="mt-1 text-xs text-muted">support@kseerat.com</p>
            </div>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-5 text-center shadow-card">
              <Clock size={24} className="mx-auto text-brand" />
              <h3 className="mt-3 font-cairo text-sm font-bold text-ink">ساعات العمل</h3>
              <p className="mt-1 text-xs text-muted">
                {settings?.workingHoursAr || "الأحد – الخميس 8:00 ص – 10:00 م"}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-card">
            <h3 className="font-cairo text-base font-bold text-ink">أرسل لنا رسالة مباشرة</h3>
            <p className="mt-1 text-xs text-muted">يسعدنا تلقي استفساراتك واقتراحاتك في أي وقت</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input placeholder="الاسم الكريم" className="input-luxe" />
              <input placeholder="رقم الجوال أو البريد" className="input-luxe" />
              <textarea
                placeholder="كيف يمكننا مساعدتك؟"
                className="input-luxe h-28 resize-none py-2.5 sm:col-span-2"
              />
              <button className="btn-brand sm:col-span-2 py-3 text-xs">
                إرسال الرسالة ←
              </button>
            </div>
          </div>
        </div>
      ),
    },

    complaints: {
      titleAr: "الشكاوى والمقترحات",
      subtitleAr: "صوتك مسموع، ورضاك هو غايتنا الأولى دائماً",
      content: (
        <div className="space-y-6">
          <p className="text-sm leading-7 text-muted">
            في كسيرات نؤمن أن التميز يبدأ بالاستماع إليكم. إذا واجهتكم أي ملاحظة بشأن جودة المنتج، أو تأخر التوصيل، أو لديكم اقتراح لتطوير خدماتنا، نرجو تعبئة النموذج التالي ليصل مباشرة لإدارة الجودة.
          </p>
          <div className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-card">
            <div className="grid gap-3 sm:grid-cols-2">
              <input placeholder="الاسم" className="input-luxe" />
              <input placeholder="رقم الطلب (إن وجد)" className="input-luxe" />
              <input placeholder="رقم الجوال للتواصل" className="input-luxe sm:col-span-2" />
              <textarea
                placeholder="تفاصيل الشكوى أو المقترح..."
                className="input-luxe h-32 resize-none py-2.5 sm:col-span-2"
              />
              <button className="btn-brand sm:col-span-2 py-3 text-xs">
                إرسال لإدارة المتجر
              </button>
            </div>
          </div>
        </div>
      ),
    },

    blog: {
      titleAr: "مدونة كسيرات",
      subtitleAr: "مقالات وأسرار عن صناعة العطور، وتاريخ دهن العود، وفنون التطيب",
      content: (
        <div className="grid gap-6 sm:grid-cols-2">
          {[
            {
              title: "كيف تفرق بين دهن العود الكمبودي الأصلي والمغشوش؟",
              date: "14 أكتوبر 2026",
              excerpt: "دليل شامل لاختبار نقاء دهن العود وثباته على البشرة وأهم الفروقات في الرائحة والرواسب.",
            },
            {
              title: "الهرم العطري: كيف تختار عطرك المناسب لفصول السنة؟",
              date: "8 أكتوبر 2026",
              excerpt: "فهم قمة العطر وقلبه وقاعدته يساعدك في اختيار العطر المناسب للعمل والمناسبات الخاصة.",
            },
            {
              title: "أصول الضيافة الخليجية: المبسوس والبخور في المجالس",
              date: "28 سبتمبر 2026",
              excerpt: "تاريخ البخور والمبسوس الملكي وطريقة استخدامه لإضفاء أجواء الضيافة والفخامة.",
            },
          ].map((post, i) => (
            <div key={i} className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card">
              <span className="text-[10px] font-bold text-brand">{post.date}</span>
              <h3 className="mt-2 font-cairo text-sm font-bold text-ink">{post.title}</h3>
              <p className="mt-2 text-xs leading-6 text-muted">{post.excerpt}</p>
            </div>
          ))}
        </div>
      ),
    },
  };

  const page = pages[slug];
  if (!page) {
    notFound();
  }

  return (
    <div className="container-luxe max-w-4xl py-12">
      <div className="mb-8 text-center">
        <span className="text-xs font-bold tracking-[0.3em] text-brand">KSEERAT</span>
        <h1 className="mt-2 font-cairo text-2xl font-bold text-ink sm:text-3xl">
          {page.titleAr}
        </h1>
        <p className="mt-2 text-xs text-muted">{page.subtitleAr}</p>
        <div className="gold-divider mx-auto mt-6 max-w-xs" />
      </div>

      <div className="mt-8">{page.content}</div>

      <div className="mt-12 text-center">
        <Link href="/" className="btn-brand px-8 py-3 text-xs font-bold">
          ← العودة للمتجر
        </Link>
      </div>
    </div>
  );
}

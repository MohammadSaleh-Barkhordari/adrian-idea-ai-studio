import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const CookiePolicyPageFa = () => {
  const { language } = useLanguage();
  
  useEffect(() => {
    document.title = 'سیاست کوکی | آدرین ایده کوشا';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'سیاست استفاده از کوکی‌ها در وب‌سایت آدرین ایده کوشا. چگونه از کوکی‌ها استفاده می‌کنیم و چگونه می‌توانید آن‌ها را مدیریت کنید.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'سیاست استفاده از کوکی‌ها در وب‌سایت آدرین ایده کوشا. چگونه از کوکی‌ها استفاده می‌کنیم و چگونه می‌توانید آن‌ها را مدیریت کنید.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navigation />

      {/* Content */}
      <main className="container mx-auto px-6 py-16 max-w-4xl font-sahel">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-right">سیاست کوکی</h1>
        <p className="text-muted-foreground mb-8 text-right">تاریخ اجرا: ۱۰ مهر ۱۴۰۴</p>

        <div className="prose prose-slate max-w-none space-y-8 text-right">
          {/* Introduction */}
          <section>
            <p className="text-lg leading-relaxed">
              این سیاست کوکی توضیح می‌دهد که آدرین ایده کوشا («ما»، «خود» یا «ما») چگونه از کوکی‌ها و فناوری‌های مشابه در وب‌سایت خود استفاده می‌کند. این سیاست مطابق با قوانین جمهوری اسلامی ایران درباره حفظ حریم خصوصی و حمایت از داده‌های کاربران تدوین شده است.
            </p>
          </section>

          {/* What Are Cookies */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۱. کوکی چیست؟</h2>
            <p className="leading-relaxed mb-4">
              کوکی‌ها فایل‌های متنی کوچکی هستند که هنگام بازدید از یک وب‌سایت در دستگاه شما (رایانه، گوشی هوشمند یا دستگاه الکترونیکی دیگر) قرار می‌گیرند. آن‌ها به‌طور گسترده برای کارکرد کارآمدتر وب‌سایت‌ها و ارائه تجربه کاربری بهتر، و همچنین ارائه اطلاعات به مالکان وب‌سایت استفاده می‌شوند.
            </p>
            <p className="leading-relaxed">
              کوکی‌ها می‌توانند «پایدار» یا «جلسه‌ای» باشند. کوکی‌های پایدار پس از بستن مرورگر در دستگاه شما باقی می‌مانند تا زمانی که حذف شوند یا به تاریخ انقضای خود برسند. کوکی‌های جلسه‌ای موقت هستند و هنگامی که مرورگر را می‌بندید حذف می‌شوند.
            </p>
          </section>

          {/* Why We Use Cookies */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۲. چرا از کوکی استفاده می‌کنیم</h2>
            <p className="leading-relaxed mb-4">
              ما از کوکی به دلایل متعددی استفاده می‌کنیم:
            </p>
            <ul className="list-disc pr-6 space-y-2">
              <li>فعال کردن برخی عملکردهای وب‌سایت</li>
              <li>ارائه تجزیه و تحلیل و جمع‌آوری آمار درباره استفاده از وب‌سایت</li>
              <li>بهبود تجربه کاربری با به خاطر سپردن تنظیمات شما</li>
              <li>بهبود عملکرد و قابلیت‌های وب‌سایت</li>
              <li>ارائه محتوا و تبلیغات مرتبط (در صورت وجود)</li>
              <li>درک چگونگی تعامل بازدیدکنندگان با وب‌سایت ما</li>
            </ul>
          </section>

          {/* Types of Cookies */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۳. انواع کوکی‌هایی که استفاده می‌کنیم</h2>
            
            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3 text-foreground">۳.۱ کوکی‌های ضروری</h3>
                <p className="leading-relaxed mb-3">
                  <strong>هدف:</strong> این کوکی‌ها برای عملکرد صحیح وب‌سایت کاملاً ضروری هستند. آن‌ها قابلیت‌های اصلی مانند امنیت، مدیریت شبکه و دسترسی‌پذیری را فعال می‌کنند.
                </p>
                <p className="leading-relaxed mb-3">
                  <strong>مثال‌ها:</strong>
                </p>
                <ul className="list-disc pr-6 space-y-1">
                  <li>کوکی‌های احراز هویت که شما را در سیستم نگه می‌دارند</li>
                  <li>کوکی‌های امنیتی که در برابر فعالیت‌های متقلبانه محافظت می‌کنند</li>
                  <li>کوکی‌های توزیع بار که ترافیک را در سرورها توزیع می‌کنند</li>
                  <li>کوکی‌های سفارشی‌سازی رابط کاربری</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  <strong>پایه قانونی:</strong> این کوکی‌ها برای عملکرد وب‌سایت ضروری هستند و نیازی به رضایت شما ندارند.
                </p>
                <p className="leading-relaxed mt-2">
                  <strong>مدت زمان:</strong> جلسه‌ای یا تا ۱۲ ماه
                </p>
              </div>

              {/* Performance Cookies */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3 text-foreground">۳.۲ کوکی‌های عملکردی</h3>
                <p className="leading-relaxed mb-3">
                  <strong>هدف:</strong> این کوکی‌ها اطلاعاتی درباره نحوه استفاده بازدیدکنندگان از وب‌سایت ما جمع‌آوری می‌کنند، مانند اینکه کدام صفحات بیشتر بازدید می‌شوند و آیا کاربران پیام‌های خطا دریافت می‌کنند.
                </p>
                <p className="leading-relaxed mb-3">
                  <strong>مثال‌ها:</strong>
                </p>
                <ul className="list-disc pr-6 space-y-1">
                  <li>کوکی‌های تحلیلی که بازدید صفحات و مسیرهای کاربر را ردیابی می‌کنند</li>
                  <li>کوکی‌های ردیابی خطا که به ما کمک می‌کنند مشکلات را شناسایی و رفع کنیم</li>
                  <li>کوکی‌های آزمایش که به ما کمک می‌کنند عملکرد وب‌سایت را بهبود بخشیم</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  <strong>پایه قانونی:</strong> این کوکی‌ها نیاز به رضایت شما دارند.
                </p>
                <p className="leading-relaxed mt-2">
                  <strong>مدت زمان:</strong> تا ۲۴ ماه
                </p>
              </div>

              {/* Functionality Cookies */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3 text-foreground">۳.۳ کوکی‌های قابلیتی</h3>
                <p className="leading-relaxed mb-3">
                  <strong>هدف:</strong> این کوکی‌ها به وب‌سایت ما اجازه می‌دهند انتخاب‌های شما (مانند ترجیح زبان) را به خاطر بسپارد و ویژگی‌های پیشرفته و شخصی‌سازی‌شده‌تر ارائه دهد.
                </p>
                <p className="leading-relaxed mb-3">
                  <strong>مثال‌ها:</strong>
                </p>
                <ul className="list-disc pr-6 space-y-1">
                  <li>کوکی‌های ترجیح زبان</li>
                  <li>کوکی‌های ترجیح تم (حالت تیره/روشن)</li>
                  <li>کوکی‌های منطقه یا موقعیت</li>
                  <li>کوکی‌های ترجیح دسترسی‌پذیری</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  <strong>پایه قانونی:</strong> این کوکی‌ها نیاز به رضایت شما دارند.
                </p>
                <p className="leading-relaxed mt-2">
                  <strong>مدت زمان:</strong> تا ۱۲ ماه
                </p>
              </div>

              {/* Targeting Cookies */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3 text-foreground">۳.۴ کوکی‌های هدفمند/تبلیغاتی</h3>
                <p className="leading-relaxed mb-3">
                  <strong>هدف:</strong> این کوکی‌ها برای ارائه تبلیغات مرتبط‌تر با شما و علایق شما استفاده می‌شوند. آن‌ها همچنین ممکن است برای محدود کردن دفعات مشاهده یک تبلیغ و اندازه‌گیری اثربخشی کمپین‌های تبلیغاتی استفاده شوند.
                </p>
                <p className="leading-relaxed mb-3">
                  <strong>مثال‌ها:</strong>
                </p>
                <ul className="list-disc pr-6 space-y-1">
                  <li>کوکی‌های شبکه تبلیغاتی</li>
                  <li>کوکی‌های رسانه‌های اجتماعی برای تبلیغات شخصی‌سازی‌شده</li>
                  <li>کوکی‌های بازهدف‌گذاری</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  <strong>پایه قانونی:</strong> این کوکی‌ها نیاز به رضایت صریح شما دارند.
                </p>
                <p className="leading-relaxed mt-2">
                  <strong>مدت زمان:</strong> تا ۲۴ ماه
                </p>
              </div>
            </div>
          </section>

          {/* Consent Mechanism */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۴. چگونه رضایت بدهیم یا پس بگیریم</h2>
            <p className="leading-relaxed mb-4">
              هنگامی که برای اولین بار از وب‌سایت ما بازدید می‌کنید، یک بنر کوکی خواهید دید که استفاده ما از کوکی‌ها را توضیح می‌دهد. شما می‌توانید انتخاب کنید:
            </p>
            <ul className="list-disc pr-6 space-y-2">
              <li><strong>پذیرش همه کوکی‌ها:</strong> با کلیک بر روی «پذیرش همه»، شما به همه کوکی‌ها رضایت می‌دهید</li>
              <li><strong>رد کوکی‌های غیرضروری:</strong> با کلیک بر روی «رد»، فقط به کوکی‌های ضروری رضایت می‌دهید</li>
              <li><strong>سفارشی‌سازی تنظیمات:</strong> با کلیک بر روی «تنظیمات کوکی»، می‌توانید انتخاب کنید کدام دسته‌های کوکی را بپذیرید</li>
            </ul>
            <p className="leading-relaxed mt-4 mb-4">
              شما می‌توانید در هر زمان تنظیمات کوکی خود را تغییر دهید:
            </p>
            <ul className="list-disc pr-6 space-y-2">
              <li>با کلیک بر روی لینک «تنظیمات کوکی» در پاورقی وب‌سایت ما</li>
              <li>تنظیم تنظیمات مرورگر خود (به بخش ۵ زیر مراجعه کنید)</li>
              <li>تماس مستقیم با ما از طریق ایمیل contact@adrianidea.ir</li>
            </ul>
            <p className="leading-relaxed mt-4">
              لطفاً توجه داشته باشید که اگر انتخاب کنید همه کوکی‌ها (از جمله کوکی‌های ضروری) را مسدود کنید، برخی بخش‌های وب‌سایت ما ممکن است به‌درستی کار نکنند.
            </p>
          </section>

          {/* Browser Settings */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۵. مدیریت کوکی‌ها از طریق مرورگر</h2>
            <p className="leading-relaxed mb-4">
              اکثر مرورگرهای وب به شما اجازه می‌دهند تنظیمات کوکی خود را از طریق تنظیمات آن‌ها مدیریت کنید. می‌توانید مرورگر خود را طوری تنظیم کنید که کوکی‌ها را رد کند یا هنگام ارسال کوکی به شما هشدار دهد. با این حال، لطفاً توجه داشته باشید که اگر کوکی‌ها را غیرفعال کنید، برخی ویژگی‌های وب‌سایت ما ممکن است به‌درستی کار نکنند.
            </p>
            <p className="leading-relaxed mb-4">
              در اینجا پیوندهایی به دستورالعمل‌های مدیریت کوکی برای مرورگرهای محبوب آورده شده است:
            </p>
            <ul className="list-disc pr-6 space-y-2">
              <li><a href="https://support.google.com/chrome/answer/95647" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">گوگل کروم</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">موزیلا فایرفاکس</a></li>
              <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">سافاری</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">مایکروسافت اج</a></li>
              <li><a href="https://help.opera.com/en/latest/web-preferences/#cookies" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">اپرا</a></li>
            </ul>
          </section>

          {/* Updates to Policy */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۶. تغییرات در این سیاست کوکی</h2>
            <p className="leading-relaxed">
              ما ممکن است گاهی اوقات این سیاست کوکی را برای بازتاب تغییرات در رویه‌های خود یا به دلایل عملیاتی، قانونی یا نظارتی دیگر به‌روزرسانی کنیم. ما شما را از هرگونه تغییر مهم با ارسال سیاست به‌روزشده در وب‌سایت خود و به‌روزرسانی تاریخ «تاریخ اجرا» در بالای این صفحه مطلع خواهیم کرد. شما را تشویق می‌کنیم که به‌طور دوره‌ای این سیاست کوکی را بررسی کنید.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۷. تماس با ما</h2>
            <p className="leading-relaxed mb-4">
              اگر سؤالی در مورد استفاده ما از کوکی‌ها یا این سیاست کوکی دارید، لطفاً با ما تماس بگیرید:
            </p>
            <div className="bg-card border border-border rounded-lg p-6 space-y-2">
              <p><strong>نام شرکت:</strong> آدرین ایده کوشا</p>
              <p><strong>ایمیل:</strong> <a href="mailto:contact@adrianidea.ir" className="text-accent hover:underline">contact@adrianidea.ir</a></p>
              <p><strong>تلفن:</strong> <a href="tel:+989125633479" className="text-accent hover:underline" dir="ltr">۰۹۱۲ ۵۶۳ ۳۴۷۹</a></p>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CookiePolicyPageFa;

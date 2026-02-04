import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const DataProcessingPageFa = () => {
  const { language } = useLanguage();
  
  useEffect(() => {
    document.title = 'پردازش داده‌ها | آدرین ایده کوشا';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'شرایط و الزامات مربوط به پردازش داده‌های شخصی توسط آدرین ایده کوشا. مطابق با قوانین جمهوری اسلامی ایران.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'شرایط و الزامات مربوط به پردازش داده‌های شخصی توسط آدرین ایده کوشا. مطابق با قوانین جمهوری اسلامی ایران.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navigation />

      {/* Content */}
      <main className="container mx-auto px-6 py-16 max-w-4xl font-sahel">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-right">پردازش داده‌ها</h1>
        <p className="text-muted-foreground mb-8 text-right">تاریخ اجرا: ۱۰ مهر ۱۴۰۴</p>

        <div className="prose prose-slate max-w-none space-y-8 text-right">
          {/* Introduction */}
          <section>
            <p className="text-lg leading-relaxed mb-4">
              این سند شرایط و الزامات مربوط به پردازش داده‌های شخصی توسط شرکت آدرین ایده کوشا («پردازشگر داده») را مشخص می‌کند. این شرایط مطابق با قوانین جمهوری اسلامی ایران از جمله قانون تجارت الکترونیک و قوانین حمایت از داده‌های شخصی تدوین شده است.
            </p>
            <p className="leading-relaxed">
              این سند حقوق و تعهدات طرفین را در ارتباط با پردازش داده‌های شخصی در رابطه با خدمات ارائه‌شده مشخص می‌کند.
            </p>
          </section>

          {/* Definitions */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۱. تعاریف</h2>
            <p className="leading-relaxed mb-4">
              در این سند، اصطلاحات زیر دارای معانی ذکرشده هستند:
            </p>
            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <p><strong>«کنترل‌کننده داده»</strong> به مشتری گفته می‌شود که اهداف و روش‌های پردازش داده‌های شخصی را تعیین می‌کند.</p>
              <p><strong>«پردازشگر داده»</strong> به آدرین ایده کوشا گفته می‌شود که داده‌های شخصی را از طرف کنترل‌کننده داده پردازش می‌کند.</p>
              <p><strong>«داده‌های شخصی»</strong> به هر اطلاعاتی گفته می‌شود که مربوط به یک فرد شناسایی‌شده یا قابل شناسایی است.</p>
              <p><strong>«پردازش»</strong> به هر عملیات یا مجموعه عملیاتی گفته می‌شود که بر روی داده‌های شخصی انجام می‌شود، مانند جمع‌آوری، ثبت، سازماندهی، ذخیره‌سازی، تطبیق، بازیابی، استفاده، افشا یا حذف.</p>
              <p><strong>«صاحب داده»</strong> به فردی گفته می‌شود که داده‌های شخصی به او مربوط می‌شود.</p>
              <p><strong>«پردازشگر فرعی»</strong> به هر پردازشگری گفته می‌شود که توسط آدرین ایده کوشا برای پردازش داده‌های شخصی از طرف کنترل‌کننده داده استخدام شده است.</p>
            </div>
          </section>

          {/* Scope of Processing */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۲. محدوده و ماهیت پردازش</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">۲.۱ موضوع</h3>
                <p className="leading-relaxed">
                  پردازشگر داده، داده‌های شخصی را از طرف کنترل‌کننده داده در ارتباط با ارائه راهکارهای کسب‌وکاری مبتنی بر هوش مصنوعی، تحلیل‌ها و خدمات مشاوره همان‌طور که در قرارداد اصلی خدمات شرح داده شده است، پردازش می‌کند.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">۲.۲ مدت زمان پردازش</h3>
                <p className="leading-relaxed">
                  پردازش برای مدت زمان قرارداد خدمات و برای مدتی پس از آن که ممکن است برای تکمیل اهداف ذکرشده در این سند ضروری باشد، ادامه خواهد یافت.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">۲.۳ ماهیت و هدف پردازش</h3>
                <p className="leading-relaxed mb-3">پردازشگر داده ممکن است فعالیت‌های پردازش زیر را انجام دهد:</p>
                <ul className="list-disc pr-6 space-y-2">
                  <li>جمع‌آوری، ذخیره‌سازی و سازماندهی داده‌های شخصی</li>
                  <li>تجزیه و تحلیل و پردازش داده‌ها با استفاده از الگوریتم‌های هوش مصنوعی و یادگیری ماشین</li>
                  <li>تولید گزارش‌ها، بینش‌ها و توصیه‌ها</li>
                  <li>پشتیبانی فنی و نگهداری سیستم‌ها</li>
                  <li>فعالیت‌های تضمین کیفیت و بهبود خدمات</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">۲.۴ انواع داده‌های شخصی</h3>
                <p className="leading-relaxed mb-3">داده‌های شخصی پردازش‌شده ممکن است شامل موارد زیر باشد اما محدود به آن‌ها نیست:</p>
                <ul className="list-disc pr-6 space-y-2">
                  <li>اطلاعات تماس (نام، آدرس ایمیل، شماره تلفن)</li>
                  <li>اطلاعات حرفه‌ای (عنوان شغلی، نام شرکت)</li>
                  <li>داده‌های استفاده و اطلاعات تحلیلی</li>
                  <li>داده‌های معامله تجاری</li>
                  <li>سوابق ارتباطات</li>
                  <li>داده‌های فنی (آدرس IP، اطلاعات دستگاه)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">۲.۵ دسته‌های صاحبان داده</h3>
                <p className="leading-relaxed mb-3">صاحبان داده ممکن است شامل موارد زیر باشند:</p>
                <ul className="list-disc pr-6 space-y-2">
                  <li>کارمندان و پیمانکاران کنترل‌کننده داده</li>
                  <li>مشتریان و مشتریان کنترل‌کننده داده</li>
                  <li>تأمین‌کنندگان و شرکا کنترل‌کننده داده</li>
                  <li>بازدیدکنندگان و کاربران وب‌سایت</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Obligations of Processor */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۳. تعهدات پردازشگر داده</h2>
            <p className="leading-relaxed mb-4">
              پردازشگر داده موظف است:
            </p>
            <ul className="list-disc pr-6 space-y-2">
              <li>داده‌های شخصی را فقط بر اساس دستورالعمل‌های مستند کنترل‌کننده داده پردازش کند، مگر اینکه قانون الزام کند</li>
              <li>اطمینان حاصل کند که افراد مجاز برای پردازش داده‌های شخصی به محرمانه بودن متعهد شده‌اند یا تحت تعهد قانونی مناسب محرمانه بودن هستند</li>
              <li>اقدامات فنی و سازمانی مناسب برای اطمینان از سطح امنیتی متناسب با ریسک را اجرا کند</li>
              <li>شرایط استخدام پردازشگران فرعی را رعایت کند</li>
              <li>به کنترل‌کننده داده در پاسخگویی به درخواست‌های حقوق صاحبان داده کمک کند</li>
              <li>به کنترل‌کننده داده در اطمینان از رعایت تعهدات حفاظت از داده کمک کند</li>
              <li>پس از پایان ارائه خدمات، تمام داده‌های شخصی را به کنترل‌کننده داده حذف یا بازگرداند، مگر اینکه قانون الزام به نگهداری داده کند</li>
              <li>تمام اطلاعات لازم برای نشان دادن انطباق با این سند را در اختیار کنترل‌کننده داده قرار دهد</li>
              <li>فوراً به کنترل‌کننده داده اطلاع دهد اگر به نظر او، یک دستورالعمل قوانین حفاظت از داده را نقض می‌کند</li>
            </ul>
          </section>

          {/* Security Measures */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۴. اقدامات امنیتی</h2>
            <p className="leading-relaxed mb-4">
              پردازشگر داده اقدامات فنی و سازمانی مناسب را برای محافظت از داده‌های شخصی در برابر پردازش غیرمجاز یا غیرقانونی، از دست رفتن تصادفی، تخریب یا آسیب اجرا و حفظ خواهد کرد. این اقدامات شامل:
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">۴.۱ اقدامات فنی</h3>
                <ul className="list-disc pr-6 space-y-2">
                  <li>رمزگذاری داده‌های شخصی در حین انتقال و در حالت استراحت</li>
                  <li>به‌روزرسانی‌های امنیتی منظم و مدیریت وصله</li>
                  <li>مکانیزم‌های احراز هویت امن و کنترل دسترسی</li>
                  <li>اقدامات امنیت شبکه از جمله فایروال‌ها و سیستم‌های تشخیص نفوذ</li>
                  <li>آزمایش امنیتی منظم و ارزیابی آسیب‌پذیری</li>
                  <li>رویه‌های پشتیبان‌گیری امن از داده و بازیابی بلایا</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">۴.۲ اقدامات سازمانی</h3>
                <ul className="list-disc pr-6 space-y-2">
                  <li>سیاست‌ها و رویه‌های حفاظت از داده</li>
                  <li>آموزش کارکنان در مورد حفاظت از داده و امنیت</li>
                  <li>قراردادهای محرمانه با کارمندان و پیمانکاران</li>
                  <li>کنترل دسترسی و مدیریت امتیازات</li>
                  <li>رویه‌های پاسخ به حوادث و اعلان نقض</li>
                  <li>ممیزی‌های منظم و بررسی‌های انطباق</li>
                  <li>امنیت فیزیکی تسهیلات و تجهیزات</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Breach Notification */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۵. اعلان نقض داده</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">۵.۱ تعهد اطلاع‌رسانی</h3>
                <p className="leading-relaxed">
                  پردازشگر داده موظف است بدون تأخیر غیرضروری، و در هر صورت ظرف ۲۴ ساعت، پس از آگاهی از نقض داده‌های شخصی که بر داده‌های شخصی کنترل‌کننده داده تأثیر می‌گذارد، کنترل‌کننده داده را مطلع کند.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">۵.۲ اطلاعات نقض</h3>
                <p className="leading-relaxed mb-3">
                  اعلان باید تا حد امکان شامل موارد زیر باشد:
                </p>
                <ul className="list-disc pr-6 space-y-2">
                  <li>شرح ماهیت نقض داده‌های شخصی، از جمله دسته‌ها و تعداد تقریبی صاحبان داده مربوطه و دسته‌ها و تعداد تقریبی سوابق داده‌های شخصی مربوطه</li>
                  <li>نام و جزئیات تماس مسئول حفاظت از داده پردازشگر داده یا نقطه تماس دیگر</li>
                  <li>شرح عواقب احتمالی نقض داده‌های شخصی</li>
                  <li>شرح اقدامات انجام‌شده یا پیشنهادی برای رسیدگی به نقض و کاهش اثرات نامطلوب احتمالی آن</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">۵.۳ همکاری</h3>
                <p className="leading-relaxed">
                  پردازشگر داده با کنترل‌کننده داده همکاری خواهد کرد و چنین کمکی را که ممکن است به‌طور معقول برای تحقیق و اصلاح نقض درخواست شود و برای فعال کردن کنترل‌کننده داده برای رعایت تعهدات خود تحت قوانین حفاظت از داده، از جمله اعلان به مراجع نظارتی و صاحبان داده در صورت نیاز، ارائه خواهد داد.
                </p>
              </div>
            </div>
          </section>

          {/* Termination and Return of Data */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۶. خاتمه و بازگشت داده‌ها</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">۶.۱ پس از خاتمه</h3>
                <p className="leading-relaxed">
                  پس از پایان ارائه خدمات مرتبط با پردازش، پردازشگر داده، طبق انتخاب کنترل‌کننده داده، همه داده‌های شخصی را حذف یا به کنترل‌کننده داده بازمی‌گرداند و نسخه‌های موجود را حذف می‌کند، مگر اینکه قانون اتحادیه اروپا یا قوانین ایران الزام به ذخیره داده‌های شخصی کند.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">۶.۲ تأیید</h3>
                <p className="leading-relaxed">
                  در درخواست کنترل‌کننده داده، پردازشگر داده تأیید کتبی ارائه خواهد داد که همه داده‌های شخصی حذف یا بازگردانده شده‌اند.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۷. تماس با ما</h2>
            <p className="leading-relaxed mb-4">
              اگر سؤالی در مورد پردازش داده‌ها یا این سند دارید، لطفاً با ما تماس بگیرید:
            </p>
            <div className="bg-card border border-border rounded-lg p-6 space-y-2">
              <p><strong>نام شرکت:</strong> آدرین ایده کوشا</p>
              <p><strong>تماس با حفاظت از داده:</strong> contact@adrianidea.ir</p>
              <p><strong>تلفن:</strong> <a href="tel:+989125633479" className="text-accent hover:underline" dir="ltr">۰۹۱۲ ۵۶۳ ۳۴۷۹</a></p>
              <p><strong>آدرس:</strong> ایران، تهران</p>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DataProcessingPageFa;

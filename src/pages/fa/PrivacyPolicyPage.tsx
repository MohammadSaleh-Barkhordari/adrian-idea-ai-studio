import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const PrivacyPolicyPageFa = () => {
  const { language } = useLanguage();
  
  useEffect(() => {
    document.title = 'سیاست حفظ حریم خصوصی | آدرین ایده کوشا';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'سیاست حفظ حریم خصوصی شرکت آدرین ایده کوشا مطابق با قوانین جمهوری اسلامی ایران از جمله قانون تجارت الکترونیک و قوانین حمایت از داده‌های شخصی.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'سیاست حفظ حریم خصوصی شرکت آدرین ایده کوشا مطابق با قوانین جمهوری اسلامی ایران از جمله قانون تجارت الکترونیک و قوانین حمایت از داده‌های شخصی.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navigation />

      {/* Content */}
      <main className="container mx-auto px-6 py-16 max-w-4xl font-sahel">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-right">سیاست حفظ حریم خصوصی</h1>
        <p className="text-muted-foreground mb-8 text-right">تاریخ اجرا: ۱۰ مهر ۱۴۰۴</p>

        <div className="prose prose-slate max-w-none space-y-8 text-right">
          {/* Introduction */}
          <section>
            <p className="text-lg leading-relaxed">
              ما، شرکت آدرین ایده کوشا، متعهد به حفاظت از حریم خصوصی کاربران خود هستیم. این سیاست مطابق با قوانین جمهوری اسلامی ایران از جمله قانون تجارت الکترونیک و قوانین حمایت از داده‌های شخصی تدوین شده است.
            </p>
          </section>

          {/* Data Controller Information */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۱. اطلاعات شرکت</h2>
            <p className="leading-relaxed mb-4">
              آدرین ایده کوشا مسئول پردازش و حفاظت از داده‌های شخصی شماست. برای تماس با ما می‌توانید از اطلاعات زیر استفاده کنید:
            </p>
            <div className="bg-card border border-border rounded-lg p-6 space-y-2">
              <p><strong>نام شرکت:</strong> آدرین ایده کوشا</p>
              <p><strong>ایمیل:</strong> contact@adrianidea.ir</p>
              <p><strong>تلفن:</strong> <span dir="ltr">۰۹۱۲ ۵۶۳ ۳۴۷۹</span></p>
              <p><strong>آدرس:</strong> ایران، تهران</p>
            </div>
          </section>

          {/* Types of Data Collected */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۲. اطلاعات جمع‌آوری‌شده</h2>
            <p className="leading-relaxed mb-4">ما ممکن است دسته‌های زیر از اطلاعات شخصی را جمع‌آوری کنیم:</p>
            <ul className="list-disc pr-6 space-y-2">
              <li><strong>اطلاعات هویتی:</strong> نام، نام کاربری یا شناسه مشابه</li>
              <li><strong>اطلاعات تماس:</strong> آدرس ایمیل، شماره تلفن، آدرس پستی</li>
              <li><strong>داده‌های فنی:</strong> آدرس IP، نوع و نسخه مرورگر، تنظیمات منطقه زمانی، سیستم عامل</li>
              <li><strong>داده‌های استفاده:</strong> اطلاعات مربوط به نحوه استفاده شما از وب‌سایت و خدمات</li>
              <li><strong>داده‌های بازاریابی و ارتباطات:</strong> ترجیحات شما در دریافت پیام‌های بازاریابی</li>
              <li><strong>داده‌های پروفایل:</strong> نام کاربری و رمز عبور، خریدها یا سفارش‌های شما، علایق، بازخوردها</li>
            </ul>
          </section>

          {/* Purpose of Data Processing */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۳. هدف از جمع‌آوری و پردازش داده‌ها</h2>
            <p className="leading-relaxed mb-4">ما اطلاعات شخصی شما را برای اهداف زیر پردازش می‌کنیم:</p>
            <ul className="list-disc pr-6 space-y-2">
              <li>ارائه و نگهداری خدمات</li>
              <li>اطلاع‌رسانی درباره تغییرات خدمات</li>
              <li>ارائه پشتیبانی به مشتریان</li>
              <li>جمع‌آوری تحلیل‌ها و اطلاعات ارزشمند برای بهبود خدمات</li>
              <li>نظارت بر استفاده از خدمات</li>
              <li>تشخیص، جلوگیری و رفع مشکلات فنی</li>
              <li>ارائه اخبار، پیشنهادات ویژه و اطلاعات کلی درباره محصولات و خدمات</li>
              <li>رعایت الزامات قانونی</li>
            </ul>
          </section>

          {/* Lawful Basis for Processing */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۴. پایه قانونی پردازش</h2>
            <p className="leading-relaxed mb-4">ما اطلاعات شخصی شما را بر اساس مبانی قانونی زیر پردازش می‌کنیم:</p>
            <ul className="list-disc pr-6 space-y-2">
              <li><strong>رضایت:</strong> شما رضایت صریح خود را برای پردازش اطلاعات شخصی خود برای یک هدف خاص داده‌اید</li>
              <li><strong>قرارداد:</strong> پردازش برای اجرای قراردادی که با شما داریم یا برای انجام اقداماتی قبل از انعقاد قرارداد ضروری است</li>
              <li><strong>الزام قانونی:</strong> پردازش برای رعایت قوانین ضروری است</li>
              <li><strong>منافع مشروع:</strong> پردازش برای منافع مشروع ما یا شخص ثالث ضروری است، مگر اینکه دلیل موجهی برای حفاظت از اطلاعات شخصی شما وجود داشته باشد</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۵. مدت زمان نگهداری اطلاعات</h2>
            <p className="leading-relaxed mb-4">
              ما اطلاعات شخصی شما را فقط به مدت زمانی نگهداری می‌کنیم که برای اهداف ذکرشده در این سیاست ضروری است. ما اطلاعات شخصی شما را تا حد لازم برای رعایت الزامات قانونی، حل اختلافات و اجرای توافقات قانونی خود نگهداری و استفاده خواهیم کرد.
            </p>
            <p className="leading-relaxed">
              معیارهای تعیین دوره نگهداری عبارتند از:
            </p>
            <ul className="list-disc pr-6 space-y-2 mt-2">
              <li>مدت زمان رابطه مستمر با شما</li>
              <li>وجود الزام قانونی</li>
              <li>مطلوبیت نگهداری با توجه به موقعیت قانونی ما</li>
            </ul>
          </section>

          {/* Data Subject Rights */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۶. حقوق شما</h2>
            <p className="leading-relaxed mb-4">شما به عنوان کاربر دارای حقوق زیر هستید:</p>
            <ul className="list-disc pr-6 space-y-2">
              <li><strong>حق دسترسی:</strong> شما حق دارید نسخه‌ای از اطلاعات شخصی خود را درخواست کنید</li>
              <li><strong>حق اصلاح:</strong> شما حق دارید درخواست اصلاح اطلاعاتی که فکر می‌کنید نادرست است یا تکمیل اطلاعات ناقص را بخواهید</li>
              <li><strong>حق حذف:</strong> شما حق دارید تحت شرایط خاصی، درخواست حذف اطلاعات شخصی خود را بدهید</li>
              <li><strong>حق محدودسازی پردازش:</strong> شما حق دارید تحت شرایط خاصی، درخواست محدود کردن پردازش اطلاعات شخصی خود را بدهید</li>
              <li><strong>حق اعتراض به پردازش:</strong> شما حق دارید تحت شرایط خاصی، به پردازش اطلاعات شخصی خود اعتراض کنید</li>
              <li><strong>حق قابلیت انتقال داده:</strong> شما حق دارید درخواست کنید داده‌هایی که جمع‌آوری کرده‌ایم را به سازمان دیگری منتقل کنیم</li>
            </ul>
            <p className="leading-relaxed mt-4">
              برای اعمال هر یک از این حقوق، لطفاً با ما از طریق ایمیل contact@adrianidea.ir تماس بگیرید. ما ظرف یک ماه به درخواست شما پاسخ خواهیم داد.
            </p>
          </section>

          {/* Data Transfers */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۷. انتقال داده‌های بین‌المللی</h2>
            <p className="leading-relaxed mb-4">
              اطلاعات شخصی شما ممکن است به رایانه‌هایی خارج از کشور شما منتقل و در آن‌ها نگهداری شود که قوانین حفاظت از داده در آن‌ها ممکن است با قوانین کشور شما متفاوت باشد.
            </p>
            <p className="leading-relaxed">
              اگر اطلاعات شخصی شما را خارج از ایران منتقل کنیم، اقداماتی انجام خواهیم داد تا اطمینان حاصل شود که اطلاعات شخصی شما سطح مناسبی از حفاظت دریافت می‌کند.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۸. امنیت داده‌ها</h2>
            <p className="leading-relaxed">
              ما اقدامات فنی و سازمانی مناسب را برای محافظت از اطلاعات شخصی شما در برابر پردازش غیرمجاز یا غیرقانونی، از دست رفتن تصادفی، تخریب یا آسیب اجرا می‌کنیم. این اقدامات شامل رمزگذاری، کنترل دسترسی و ارزیابی‌های منظم امنیتی است. با این حال، هیچ روش انتقال از طریق اینترنت یا روش ذخیره‌سازی الکترونیکی ۱۰۰٪ امن نیست و ما نمی‌توانیم امنیت مطلق را تضمین کنیم.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۹. خدمات شخص ثالث</h2>
            <p className="leading-relaxed mb-4">
              ما ممکن است شرکت‌ها و افراد شخص ثالث را برای تسهیل خدمات، ارائه خدمات از طرف ما، انجام خدمات مرتبط با خدمات یا کمک به ما در تجزیه و تحلیل نحوه استفاده از خدمات استخدام کنیم. این اشخاص ثالث فقط برای انجام این وظایف از طرف ما به اطلاعات شخصی شما دسترسی دارند و موظف هستند آن‌ها را برای هیچ منظور دیگری افشا یا استفاده نکنند.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۱۰. حریم خصوصی کودکان</h2>
            <p className="leading-relaxed">
              خدمات ما برای کودکان زیر ۱۳ سال در نظر گرفته نشده است. ما آگاهانه اطلاعات شخصی از کودکان زیر ۱۳ سال جمع‌آوری نمی‌کنیم. اگر والدین یا سرپرست هستید و می‌دانید که فرزندتان اطلاعات شخصی را در اختیار ما قرار داده است، لطفاً با ما تماس بگیرید. اگر متوجه شویم که بدون تأیید رضایت والدین، اطلاعات شخصی از کودکان جمع‌آوری کرده‌ایم، اقداماتی برای حذف آن اطلاعات از سرورهای خود انجام می‌دهیم.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۱۱. تغییرات در این سیاست</h2>
            <p className="leading-relaxed">
              ما ممکن است گاهی اوقات سیاست حفظ حریم خصوصی خود را به‌روزرسانی کنیم. ما با ارسال سیاست حفظ حریم خصوصی جدید در این صفحه و به‌روزرسانی تاریخ «تاریخ اجرا» در بالای این سیاست، شما را از هرگونه تغییر مطلع خواهیم کرد. توصیه می‌شود این سیاست را به‌طور دوره‌ای برای هرگونه تغییر بررسی کنید. تغییرات در این سیاست حفظ حریم خصوصی زمانی که در این صفحه منتشر می‌شوند، مؤثر هستند.
            </p>
          </section>

          {/* Complaints */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۱۲. نحوه شکایت</h2>
            <p className="leading-relaxed mb-4">
              اگر نگرانی‌ای در مورد استفاده ما از اطلاعات شخصی شما دارید، می‌توانید از طریق ایمیل contact@adrianidea.ir با ما تماس بگیرید.
            </p>
            <p className="leading-relaxed mb-4">
              همچنین می‌توانید در صورت نارضایتی از نحوه استفاده ما از داده‌های شما، به مراجع قانونی ذی‌ربط مراجعه کنید.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۱۳. تماس با ما</h2>
            <p className="leading-relaxed mb-4">
              اگر سؤالی در مورد این سیاست حفظ حریم خصوصی دارید، لطفاً با ما تماس بگیرید:
            </p>
            <div className="bg-card border border-border rounded-lg p-6 space-y-2">
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

export default PrivacyPolicyPageFa;

import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const TermsOfServicePageFa = () => {
  const { language } = useLanguage();
  
  useEffect(() => {
    document.title = 'شرایط استفاده از خدمات | آدرین ایده کوشا';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'شرایط و قوانین استفاده از خدمات وب‌سایت آدرین ایده کوشا. تحت قوانین جمهوری اسلامی ایران.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'شرایط و قوانین استفاده از خدمات وب‌سایت آدرین ایده کوشا. تحت قوانین جمهوری اسلامی ایران.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navigation />

      {/* Content */}
      <main className="container mx-auto px-6 py-16 max-w-4xl font-sahel">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-right">شرایط استفاده از خدمات</h1>
        <p className="text-muted-foreground mb-8 text-right">تاریخ اجرا: ۱۰ مهر ۱۴۰۴</p>

        <div className="prose prose-slate max-w-none space-y-8 text-right">
          {/* Introduction */}
          <section>
            <p className="text-lg leading-relaxed">
              به وب‌سایت آدرین ایده کوشا خوش آمدید. این شرایط استفاده از خدمات («شرایط») دسترسی و استفاده شما از وب‌سایت، خدمات و برنامه‌های ما (که در مجموع «خدمات» نامیده می‌شوند) را تنظیم می‌کند. با دسترسی یا استفاده از خدمات ما، شما موافقت می‌کنید که تحت این شرایط قرار بگیرید. اگر با این شرایط موافق نیستید، لطفاً از خدمات ما استفاده نکنید.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۱. پذیرش شرایط</h2>
            <p className="leading-relaxed mb-4">
              با دسترسی یا استفاده از خدمات، شما تأیید می‌کنید که این شرایط را می‌پذیرید و موافقت می‌کنید که از آن‌ها پیروی کنید. این شرایط یک قرارداد قانونی الزام‌آور بین شما و آدرین ایده کوشا را تشکیل می‌دهد.
            </p>
            <p className="leading-relaxed">
              اگر از خدمات به نمایندگی از یک سازمان استفاده می‌کنید، شما اظهار و تضمین می‌کنید که اختیار الزام آن سازمان به این شرایط را دارید، و پذیرش شما از این شرایط به عنوان پذیرش توسط آن سازمان تلقی خواهد شد.
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۲. واجد شرایط بودن</h2>
            <p className="leading-relaxed">
              برای استفاده از خدمات ما، شما باید حداقل ۱۸ سال سن داشته باشید. با استفاده از خدمات ما، شما اظهار و تضمین می‌کنید که این شرط سنی را دارید. اگر زیر ۱۸ سال هستید، فقط می‌توانید با مشارکت و رضایت والدین یا سرپرست از خدمات ما استفاده کنید.
            </p>
          </section>

          {/* User Account */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۳. حساب کاربری</h2>
            <p className="leading-relaxed mb-4">
              برای دسترسی به برخی از ویژگی‌های خدمات ما، ممکن است نیاز به ایجاد حساب کاربری داشته باشید. هنگام ایجاد حساب، موافقت می‌کنید که:
            </p>
            <ul className="list-disc pr-6 space-y-2">
              <li>اطلاعات دقیق، جاری و کامل ارائه دهید</li>
              <li>اطلاعات حساب خود را نگهداری و به سرعت به‌روزرسانی کنید</li>
              <li>امنیت حساب خود را با محافظت از رمز عبور و محدود کردن دسترسی به حساب خود حفظ کنید</li>
              <li>بلافاصله هرگونه استفاده غیرمجاز از حساب خود را به ما اطلاع دهید</li>
              <li>مسئولیت تمام فعالیت‌هایی که تحت حساب شما رخ می‌دهد را بپذیرید</li>
            </ul>
            <p className="leading-relaxed mt-4">
              ما این حق را برای خود محفوظ می‌داریم که در صورت اثبات نادرست، کاذب یا گمراه‌کننده بودن هر اطلاعاتی، حساب شما را تعلیق یا خاتمه دهیم.
            </p>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۴. مسئولیت‌های کاربر و فعالیت‌های ممنوع</h2>
            <p className="leading-relaxed mb-4">
              هنگام استفاده از خدمات ما، موافقت می‌کنید که:
            </p>
            <ul className="list-disc pr-6 space-y-2">
              <li>قوانین، مقررات یا این شرایط قابل اجرا را نقض نکنید</li>
              <li>حقوق مالکیت معنوی دیگران را نقض نکنید</li>
              <li>محتوایی که غیرقانونی، مضر، تهدیدکننده، توهین‌آمیز، افترا، مبتذل، زشت یا به‌طور دیگر ناپسند است را بارگذاری، ارسال یا انتقال ندهید</li>
              <li>خود را جای شخص یا نهاد دیگری نگذارید یا وابستگی خود را با شخص یا نهادی به دروغ بیان یا نمایش ندهید</li>
              <li>با خدمات یا سرورها یا شبکه‌های متصل به خدمات تداخل یا اختلال ایجاد نکنید</li>
              <li>سعی نکنید دسترسی غیرمجاز به هر بخش از خدمات یا هر سیستم یا شبکه دیگری به دست آورید</li>
              <li>از هیچ وسیله خودکار، از جمله رباتها، خزنده‌ها یا اسکرپرها برای دسترسی به خدمات استفاده نکنید</li>
              <li>هیچ ویروس، کرم، نقص، اسب تروجان یا هر مورد ویرانگری را منتقل نکنید</li>
              <li>بدون رضایت کتبی قبلی ما، از خدمات برای هیچ هدف تجاری استفاده نکنید</li>
              <li>در هر فعالیتی که می‌تواند به خدمات آسیب برساند، غیرفعال کند، بارگذاری اضافی کند یا آسیب برساند، مشارکت نکنید</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۵. حقوق مالکیت معنوی</h2>
            <p className="leading-relaxed mb-4">
              تمام محتوا، ویژگی‌ها و عملکرد خدمات، از جمله اما نه محدود به متن، گرافیک، لوگوها، آیکون‌ها، تصاویر، کلیپ‌های صوتی، کلیپ‌های ویدیویی، مجموعه‌های داده، نرم‌افزار و مجموعه آن‌ها («محتوا») متعلق به آدرین ایده کوشا یا دارندگان مجوز آن است و تحت قوانین حق نسخه‌برداری، علامت تجاری، اختراع، راز تجاری و سایر قوانین مالکیت معنوی یا حقوق اختصاصی ایران و بین‌المللی محافظت می‌شود.
            </p>
            <p className="leading-relaxed mb-4">
              به شما مجوز محدود، غیرانحصاری، غیرقابل انتقال و قابل لغو برای دسترسی و استفاده از خدمات برای استفاده شخصی و غیرتجاری خود داده می‌شود. این مجوز شامل هیچ حقی برای موارد زیر نمی‌شود:
            </p>
            <ul className="list-disc pr-6 space-y-2">
              <li>فروش مجدد یا هر استفاده تجاری از خدمات یا محتوا</li>
              <li>تغییر، تکثیر، توزیع، ایجاد آثار مشتق بر اساس، نمایش عمومی یا اجرای عمومی هر محتوا</li>
              <li>دانلود یا کپی هر محتوا به نفع بازرگان دیگر یا هر شخص ثالث دیگر</li>
              <li>استفاده از هر داده‌کاوی، رباتها یا روش‌های مشابه جمع‌آوری و استخراج داده</li>
            </ul>
            <p className="leading-relaxed mt-4">
              هرگونه استفاده غیرمجاز از محتوا یا خدمات ممکن است قوانین حق نسخه‌برداری، علامت تجاری و سایر قوانین را نقض کند و اکیداً ممنوع است.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۶. محدودیت مسئولیت</h2>
            <p className="leading-relaxed mb-4">
              تا حد مجاز توسط قوانین قابل اجرا، آدرین ایده کوشا، مدیران، کارمندان، شرکا، نمایندگان، تأمین‌کنندگان یا وابستگان آن مسئول هیچ خسارت غیرمستقیم، تصادفی، خاص، تبعی یا تنبیهی، از جمله اما نه محدود به از دست دادن سود، داده‌ها، استفاده، نیکی یا سایر ضررهای نامشهود ناشی از موارد زیر نخواهد بود:
            </p>
            <ul className="list-disc pr-6 space-y-2">
              <li>دسترسی شما به یا استفاده از یا عدم توانایی دسترسی یا استفاده از خدمات</li>
              <li>هر رفتار یا محتوای هر شخص ثالث در خدمات</li>
              <li>هر محتوای به‌دست‌آمده از خدمات</li>
              <li>دسترسی غیرمجاز، استفاده یا تغییر انتقالات یا محتوای شما</li>
            </ul>
            <p className="leading-relaxed mt-4">
              کل مسئولیت ما در قبال شما برای تمام ادعاهای ناشی از یا مرتبط با خدمات نباید از مبلغی که به ما پرداخت کرده‌اید (در صورت وجود) در دوازده (۱۲) ماه قبل از رویداد منجر به مسئولیت، یا ۱۰۰٫۰۰۰ تومان، هر کدام بیشتر باشد، بیشتر نخواهد بود.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۷. خاتمه</h2>
            <p className="leading-relaxed mb-4">
              ما ممکن است فوراً و بدون اطلاع قبلی یا مسئولیت، دسترسی شما به خدمات را به هر دلیلی، از جمله اما نه محدود به نقض این شرایط، خاتمه یا تعلیق دهیم.
            </p>
            <p className="leading-relaxed mb-4">
              پس از خاتمه:
            </p>
            <ul className="list-disc pr-6 space-y-2">
              <li>حق استفاده از خدمات فوراً متوقف خواهد شد</li>
              <li>ما ممکن است حساب شما و هر محتوای مرتبط با آن را حذف کنیم</li>
              <li>تمام مقررات این شرایط که بنا به ماهیت خود باید از خاتمه باقی بمانند، از جمله مقررات مالکیت، سلب مسئولیت‌های ضمانت، جبران خسارت و محدودیت‌های مسئولیت، باقی خواهند ماند</li>
            </ul>
            <p className="leading-relaxed mt-4">
              شما می‌توانید در هر زمان با تماس با ما از طریق ایمیل contact@adrianidea.ir حساب خود را خاتمه دهید.
            </p>
          </section>

          {/* Governing Law and Jurisdiction */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۸. قانون حاکم و صلاحیت قضایی</h2>
            <p className="leading-relaxed mb-4">
              این شرایط توسط قوانین جمهوری اسلامی ایران اداره و تفسیر می‌شود، بدون توجه به مقررات تعارض قوانین آن.
            </p>
            <p className="leading-relaxed">
              هرگونه اختلاف ناشی از یا مرتبط با این شرایط یا خدمات، تحت صلاحیت انحصاری دادگاه‌های جمهوری اسلامی ایران خواهد بود.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۹. تغییرات در این شرایط</h2>
            <p className="leading-relaxed mb-4">
              ما این حق را برای خود محفوظ می‌داریم که در هر زمان این شرایط را تغییر دهیم. اگر تغییرات مهمی در این شرایط ایجاد کنیم، شما را از طریق موارد زیر مطلع خواهیم کرد:
            </p>
            <ul className="list-disc pr-6 space-y-2">
              <li>ارسال شرایط به‌روزشده در خدمات</li>
              <li>به‌روزرسانی تاریخ «تاریخ اجرا» در بالای این شرایط</li>
              <li>ارسال اطلاعیه ایمیل به شما (در صورتی که آدرس ایمیل خود را به ما ارائه داده باشید)</li>
            </ul>
            <p className="leading-relaxed mt-4">
              استفاده مداوم شما از خدمات پس از ارسال هرگونه تغییر در شرایط، اذعان شما به تغییرات و رضایت شما به پایبند بودن و تحت پوشش قرار گرفتن توسط شرایط تغییریافته را تشکیل خواهد داد.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">۱۰. اطلاعات تماس</h2>
            <p className="leading-relaxed mb-4">
              اگر سؤالی در مورد این شرایط دارید، لطفاً با ما تماس بگیرید:
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

export default TermsOfServicePageFa;

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Menu,
  FileText,
  Search,
  Clock,
  Shield,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background" dir="rtl" lang="ar">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-7xl">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-3">
            <Image src="/next.svg" alt="logo" width={180} height={37} />
          </div>
        </div>
      </header>
      <section id="banner" className="relative bg-gray-200 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/bg.png"
            alt="المنصة الموحدة لمواعيد الفحص الفني الدوري للمركبات"
            fill
            priority
            className="object-contain opacity-70"
          />
        </div>

        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Text Content */}
            <div className="text-center md:text-right space-y-6">
              <div className="space-y-4">
                <h4 className="text-primary font-semibold text-lg">
                  أحد منتجات مركز سلامة المركبات
                </h4>

                <h3 className="text-3xl md:text-5xl font-bold leading-tight text-gray-900">
                  المنصة الموحدة لمواعيد الفحص الفني الدوري للمركبات
                </h3>
              </div>

              <p className="text-gray-800 text-lg leading-relaxed max-w-xl mx-auto md:mx-0">
                تتيح المنصة حجز وإدارة مواعيد الفحص الفني الدوري للمركبات لدى
                جميع الجهات المرخصة من المواصفات السعودية لتقديم الخدمة
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                <Link href="/booking">
                  <button className="bg-green-700 hover:bg-green-800 text-white px-8 py-4 rounded-lg text-lg font-medium transition shadow-md">
                    حجز موعد
                  </button>
                </Link>

                <Link href="/application">
                  <button className="border border-gray-400 hover:bg-gray-100 text-gray-800 px-8 py-4 rounded-lg text-lg font-medium transition">
                    تسجيل حساب جديد
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              كيف يجب فحص المركبات؟
            </h2>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center">
                <div className="text-white font-bold text-xl">1</div>
              </div>
              <div className="flex-1 pt-3">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  حجز الموعد
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  اختر المحطة والتاريخ والوقت المناسب لك من خلال منصتنا
                  الإلكترونية، وستصلك رسالة تأكيد فوراً.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center">
                <div className="text-white font-bold text-xl">2</div>
              </div>
              <div className="flex-1 pt-3">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  عمل كل شيء حتى الوصول
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  لن تحتاج للذهاب إلى محطة الفحص إلا في موعد فحصك فقط، توجه
                  مباشرة للمحطة المختارة.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center">
                <div className="text-white font-bold text-xl">3</div>
              </div>
              <div className="flex-1 pt-3">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  الخدمات الإضافية
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  يمكنك تتبع حالة الفحص ونتائجه من خلال حسابك الإلكتروني دون
                  الحاجة إلى الاتصال بأحد.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              خدمات منصة الفحص الفني الدوري
            </h2>
          </div>

          <div className="space-y-6">
            {/* Service 1 */}
            <Card className="p-6 border-2 border-gray-200 hover:border-emerald-500 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    حجز موعد الفحص
                  </h3>
                  <p className="text-sm text-gray-600">
                    احجز موعد الفحص الفني بكل سهولة ويسر من خلال منصتنا
                    الإلكترونية دون عناء الانتظار.
                  </p>
                </div>
              </div>
            </Card>

            {/* Service 2 */}
            <Card className="p-6 border-2 border-gray-200 hover:border-emerald-500 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    تفصيل مواعيد الفحص
                  </h3>
                  <p className="text-sm text-gray-600">
                    تتبع وإدارة جميع مواعيدك وملفاتك والفحوصات السابقة من مكان
                    واحد عبر لوحة التحكم.
                  </p>
                </div>
              </div>
            </Card>

            {/* Service 3 */}
            <Card className="p-6 border-2 border-gray-200 hover:border-emerald-500 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Search className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    إلغاء موعد الفحص
                  </h3>
                  <p className="text-sm text-gray-600">
                    يمكنك إلغاء أو تعديل الموعد إلى موعد آخر من خلال حسابك على
                    منصة الفحص الفني.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* CTA Button */}
          <div className="mt-10">
            <Link href="/booking" className="block">
              <Button
                size="lg"
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg py-6 text-base font-semibold shadow-md"
              >
                احجز الآن
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Steps Before Inspection */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              خطوات ما قبل الفحص الفني الدوري
            </h2>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <Card className="p-6 bg-white border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                حجز موعد الفحص
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                يمكنك حجز موعد الفحص من خلال المنصة الإلكترونية الخاصة بالشركات
                والمنشآت للفحص الفني الدوري.
              </p>
              <Link href="/booking">
                <Button
                  size="lg"
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg py-4 text-base font-semibold"
                >
                  احجز الآن
                </Button>
              </Link>
            </Card>

            {/* Step 2 */}
            <Card className="p-6 bg-white border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                الفحص السابق
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                تأكد من أن مركبتك تفي بكافة معايير السلامة وجميع الأوراق
                المطلوبة مكتملة قبل الحضور.
              </p>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-lg py-4 text-base font-semibold bg-transparent"
              >
                تفاصيل أكثر
              </Button>
            </Card>

            {/* Step 3 */}
            <Card className="p-6 bg-white border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                استلام الفحص الفني
              </h3>
              <p className="text-gray-600 leading-relaxed">
                بعد اجتياز الفحص، يمكنك استلام شهادة الفحص الفني إلكترونياً أو
                من المحطة مباشرة.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center space-y-6">
            <div className="inline-block p-4 bg-emerald-100 rounded-2xl mb-4">
              <Shield className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              احجز موعد الفحص من هنا الآن!
            </h2>
            <p className="text-gray-600 leading-relaxed max-w-xl mx-auto">
              منصة متكاملة وسهلة تمكنك من حجز موعد الفحص الفني الدوري لأي مركبة
              تمتلكها في دقائق.
            </p>

            <div className="space-y-3 pt-4">
              <p className="text-sm text-gray-500">012-345-6789</p>
              <p className="text-sm text-gray-500">الرقم الموحد: 920001234</p>
              <p className="text-sm text-gray-500">info@batremy.com.sa</p>
            </div>

            <Link href="/booking" className="block pt-4">
              <Button
                size="lg"
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg py-6 text-base font-semibold shadow-md"
              >
                احجز الآن
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <p className="text-sm text-gray-600 mb-4">
            تابعنا على وسائل التواصل الاجتماعي
          </p>
          <div className="flex justify-center gap-4 mb-6">
            <a
              href="#"
              className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors"
            >
              <span className="text-sm font-bold">X</span>
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors"
            >
              <span className="text-sm font-bold">YT</span>
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors"
            >
              <span className="text-sm font-bold">IG</span>
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors"
            >
              <span className="text-sm font-bold">LI</span>
            </a>
          </div>
          <p className="text-xs text-gray-500">
            © 2025 منصة سلامة المركبات - جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </div>
  );
}

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Menu, CheckCircle, FileText, Search, Clock } from "lucide-react"
import React from "react"
import Link  from "next/link"
export default function Home() {
  const handleApplictions=async()=>{
    window.location.href='/application'
  }
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl" lang="ar">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <button className="p-2">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <div className="text-right">
        <img src="/next.svg"/>
            </div>
            
          </div>
          <button className="text-sm text-gray-700">English</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 to-gray-900/50">
          <img
            src="/bg.png"
            alt="مركز الفحص"
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        <div className="relative h-full flex flex-col items-center justify-center text-white px-6 text-center">
          <h2 className="text-2xl font-bold mb-4 text-balance">منصة الفحص الفني الدوري</h2>
          <p className="text-sm text-gray-200 mb-6">نظام متقدم لخدمات الفحص الدوري والمعاينة</p>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">32</span>
              <span>فاحص فني</span>
            </div>
            <div className="w-px bg-white/30"></div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">15</span>
              <span>محطة فحص معتمدة</span>
            </div>
          </div>
        </div>
        <div className=" flex justify-center  absolute bottom-4 left-0 right-0 flex gap-3 px-4">
         <Link className="w-full flex-1 " href='/application '> <Button className="bg-emerald-700 hover:bg-emerald-800 text-white">استعلام عن الفحص</Button></Link>
         <Link className="w-full flex-1 " href='/application '>  <Button variant="outline" className="bg-white/95 hover:bg-white text-emerald-700 border-0">
            تجريب النظام
          </Button></Link>
        </div>
      </section>

      {/* Services Section */}
      <section className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">خدماتنا الإلكترونية</h3>
        <p className="text-sm text-gray-600 mb-6 text-center text-balance">
          نقدم مجموعة شاملة من الخدمات الإلكترونية لتسهيل عمليات الفحص الفني للمركبات
        </p>

        <div className="space-y-4">
          {/* Service Card 1 */}
          <Card className="p-5 bg-white border-0 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">حجز موعد الفحص</h4>
                <p className="text-sm text-gray-600 mb-3">احجز موعداً للفحص الدوري لمركبتك في أقرب محطة فحص معتمدة</p>
                <button className="text-sm text-emerald-700 hover:text-emerald-800 font-medium">← تفاصيل أكثر</button>
              </div>
            </div>
          </Card>

          {/* Service Card 2 */}
          <Card className="p-5 bg-white border-0 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">شهادة الفحص الفني</h4>
                <p className="text-sm text-gray-600 mb-3">
                  احصل على شهادة الفحص الفني المعتمدة إلكترونياً فور اجتياز الفحص
                </p>
                <button className="text-sm text-emerald-700 hover:text-emerald-800 font-medium">← تفاصيل أكثر</button>
              </div>
            </div>
          </Card>

          {/* Service Card 3 */}
          <Card className="p-5 bg-white border-0 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">استعلام عن حالة الفحص</h4>
                <p className="text-sm text-gray-600 mb-3">
                  استعلم عن أي مركبة بإدخال رقم لوحة السيارة أو رقم الهوية الوطنية
                </p>
                <button className="text-sm text-emerald-700 hover:text-emerald-800 font-medium">← تفاصيل أكثر</button>
              </div>
            </div>
          </Card>

          {/* Service Card 4 */}
          <Card className="p-5 bg-white border-0 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">البحث السريع</h4>
                <p className="text-sm text-gray-600 mb-3">
                  ابحث عن معلومات الفحص أو احجز موعداً أو استعلم عن أي خدمة بسهولة
                </p>
                <button className="text-sm text-emerald-700 hover:text-emerald-800 font-medium">← تفاصيل أكثر</button>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white h-12">رقم الهوية</Button>
          <Button
            variant="outline"
            className="w-full border-emerald-700 text-emerald-700 hover:bg-emerald-50 h-12 bg-transparent"
          >
            رقم المستخدم
          </Button>
          <button className="w-full text-sm text-gray-600 hover:text-gray-900 py-2">
            <Search className="w-4 h-4 inline-block ml-2" />
            بحث
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-emerald-700 text-white p-6 mt-6">
        <h3 className="text-xl font-bold text-center mb-2">بياناتنا بالأرقام</h3>
        <p className="text-sm text-emerald-100 text-center mb-8 text-balance">
          نفتخر بتقديم خدمات الفحص الفني بأعلى معايير الجودة والدقة في كل عام
        </p>

        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">35</div>
            <div className="text-sm text-emerald-100">محطة فحص</div>
            <div className="text-xs text-emerald-200 mt-1">محطات معتمدة على مستوى المملكة</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">+1.2M</div>
            <div className="text-sm text-emerald-100">فحص سنوي</div>
            <div className="text-xs text-emerald-200 mt-1">عدد الفحوصات المنجزة سنوياً</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">24/7</div>
            <div className="text-sm text-emerald-100">خدمة العملاء</div>
            <div className="text-xs text-emerald-200 mt-1">دعم فني على مدار الساعة</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">98%</div>
            <div className="text-sm text-emerald-100">رضا العملاء</div>
            <div className="text-xs text-emerald-200 mt-1">معدل رضا عملائنا عن خدماتنا</div>
          </div>
        </div>
      </section>

      {/* Partnerships Section */}
      <section className="p-6 bg-white">
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">شراكاتنا الاستراتيجية</h3>
        <p className="text-sm text-gray-600 text-center mb-6 text-balance">
          نتعاون مع أبرز الشركات والمؤسسات في مجال السلامة المرورية لتقديم أفضل الخدمات إلى عملائنا في المملكة العربية
          السعودية
        </p>

        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            variant="outline"
            className="rounded-full border-emerald-700 text-emerald-700 hover:bg-emerald-50 text-sm bg-transparent"
          >
            <CheckCircle className="w-4 h-4 ml-2" />
            منصة الفحص الفني الدوري
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-gray-300 text-gray-700 hover:bg-gray-50 text-sm bg-transparent"
          >
            الرقم الموحد
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-gray-300 text-gray-700 hover:bg-gray-50 text-sm bg-transparent"
          >
            More Book
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-gray-300 text-gray-700 hover:bg-gray-50 text-sm bg-transparent"
          >
            برنامج حماية
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 p-6 text-center text-sm text-gray-600 mt-6">
        <p>© 2025 مركز السلامة للفحص الفني الدوري. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  )
}

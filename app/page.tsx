import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Menu, CheckCircle, FileText, Search, Clock, ArrowLeft, Shield, Award, TrendingUp, Users } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-background" dir="rtl" lang="ar">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-3">
          <img src='/next.svg' alt="logo" width={180}/>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            English
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[url(/bg.png)] bg-contain bg-no-repeat h-full w-full s">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/50 via-green-800/60 to-secondary">
          <div className="absolute inset-0 opacity-10">
            {/* <img src="/bg.png" alt="مركز الفحص" className="w-full h-full object-cover" /> */}
          </div>
        </div>

        <div className="relative container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge className="bg-green-500-foreground/20 text-white border-green-500-foreground/30 hover:bg-green-500-foreground/30">
              نظام متقدم ومعتمد
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-balance leading-tight">
              منصة الفحص الفني الدوري
            </h1>

            <p className="text-lg md:text-xl text-white  text-pretty leading-relaxed max-w-2xl mx-auto">
              نظام متطور لخدمات الفحص الدوري والمعاينة الفنية للمركبات بأعلى معايير الجودة والأمان
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 justify-center pt-6">
              <div className="flex items-center gap-3 bg-green-500-foreground/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-green-500-foreground/20">
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-500-foreground">32</div>
                  <div className="text-sm text-green-500-foreground/80">فاحص فني معتمد</div>
                </div>
                <div className="w-12 h-12 bg-green-500-foreground/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-500-foreground" />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-green-500-foreground/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-green-500-foreground/20">
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-500-foreground">15</div>
                  <div className="text-sm text-green-500-foreground/80">محطة فحص معتمدة</div>
                </div>
                <div className="w-12 h-12 bg-green-500-foreground/20 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-500-foreground" />
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/application" className="flex-1 sm:flex-initial">
                <Button
                  size="lg"
                  className="w-full  text-white sm:w-auto bg-green-600  hover:bg-green-600/90 rounded-xl px-8 shadow-lg shadow-black/20"
                >
                  استعلام عن الفحص
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              </Link>
              <Link href="/application" className="flex-1 sm:flex-initial">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent text-white border-green-500-foreground/30 hover:bg-green-500-foreground/10 rounded-xl px-8"
                >
حجز موعد
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="text-green-500 border-green-500/30">
              خدماتنا الإلكترونية
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">خدمات شاملة لراحتك وسلامتك</h2>
            <p className="text-muted-foreground text-lg text-pretty max-w-2xl mx-auto leading-relaxed">
              نقدم مجموعة متكاملة من الخدمات الإلكترونية المتطورة لتسهيل عمليات الفحص الفني للمركبات
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Service Card 1 */}
            <Card className="group p-8 bg-card border-border hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/20 transition-colors">
                  <Clock className="w-7 h-7 text-green-500" />
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-xl font-bold text-foreground">حجز موعد الفحص</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    احجز موعداً للفحص الدوري لمركبتك في أقرب محطة فحص معتمدة بكل سهولة ويسر
                  </p>
                  <button className="text-green-500 hover:text-green-500/80 font-medium inline-flex items-center gap-2 group/btn">
                    <ArrowLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                    تفاصيل أكثر
                  </button>
                </div>
              </div>
            </Card>

            {/* Service Card 2 */}
            <Card className="group p-8 bg-card border-border hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/20 transition-colors">
                  <FileText className="w-7 h-7 text-green-500" />
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-xl font-bold text-foreground">شهادة الفحص الفني</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    احصل على شهادة الفحص الفني المعتمدة إلكترونياً فور اجتياز الفحص بنجاح
                  </p>
                  <button className="text-green-500 hover:text-green-500/80 font-medium inline-flex items-center gap-2 group/btn">
                    <ArrowLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                    تفاصيل أكثر
                  </button>
                </div>
              </div>
            </Card>

            {/* Service Card 3 */}
            <Card className="group p-8 bg-card border-border hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/20 transition-colors">
                  <Search className="w-7 h-7 text-green-500" />
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-xl font-bold text-foreground">استعلام عن حالة الفحص</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    استعلم عن أي مركبة بإدخال رقم لوحة السيارة أو رقم الهوية الوطنية بسرعة
                  </p>
                  <button className="text-green-500 hover:text-green-500/80 font-medium inline-flex items-center gap-2 group/btn">
                    <ArrowLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                    تفاصيل أكثر
                  </button>
                </div>
              </div>
            </Card>

            {/* Service Card 4 */}
            <Card className="group p-8 bg-card border-border hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/20 transition-colors">
                  <CheckCircle className="w-7 h-7 text-green-500" />
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-xl font-bold text-foreground">البحث السريع</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    ابحث عن معلومات الفحص أو احجز موعداً أو استعلم عن أي خدمة بكل سهولة
                  </p>
                  <button className="text-green-500 hover:text-green-500/80 font-medium inline-flex items-center gap-2 group/btn">
                    <ArrowLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                    تفاصيل أكثر
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 max-w-md mx-auto space-y-4">
            <Button
              size="lg"
              className="w-full bg-green-500 text-white hover:bg-green-500/90 rounded-xl shadow-lg shadow-green-500/20"
            >
              البحث برقم الهوية
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-green-500/30 text-green-500 hover:bg-green-500/5 rounded-xl bg-transparent"
            >
              البحث برقم المستخدم
            </Button>
            <button className="w-full text-muted-foreground hover:text-foreground py-3 inline-flex items-center justify-center gap-2 transition-colors">
              <Search className="w-4 h-4" />
              بحث متقدم
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-br from-green-500 via-green-500/95 to-secondary py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-4 mb-16">
            <Badge className="bg-green-500-foreground/20 text-white border-green-500-foreground/30">
              إنجازاتنا
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white text-balance">
              أرقام تتحدث عن التميز
            </h2>
            <p className="text-green-500-foreground/90 text-lg text-pretty leading-relaxed">
              نفتخر بتقديم خدمات الفحص الفني بأعلى معايير الجودة والدقة والشفافية
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="bg-green-500-foreground/10 backdrop-blur-sm border-green-500-foreground/20 p-8 text-center hover:bg-green-500-foreground/15 transition-colors">
              <div className="space-y-2">
                <TrendingUp className="w-8 h-8 text-white mx-auto mb-4" />
                <div className="text-5xl font-bold text-green-500-foreground">35</div>
                <div className="text-sm font-medium text-white ">محطة فحص</div>
                <div className="text-xs  text-white/70 text-pretty">محطات معتمدة على مستوى المملكة</div>
              </div>
            </Card>

            <Card className="bg-green-500-foreground/10 backdrop-blur-sm border-green-500-foreground/20 p-8 text-center hover:bg-green-500-foreground/15 transition-colors">
              <div className="space-y-2">
                <CheckCircle className="w-8 h-8 text-white mx-auto mb-4" />
                <div className="text-5xl font-bold text-green-500-foreground">+1.2M</div>
                <div className="text-sm font-medium text-white ">فحص سنوي</div>
                <div className="text-xs  text-white/70 text-pretty">عدد الفحوصات المنجزة سنوياً</div>
              </div>
            </Card>

            <Card className="bg-green-500-foreground/10 backdrop-blur-sm border-green-500-foreground/20 p-8 text-center hover:bg-green-500-foreground/15 transition-colors">
              <div className="space-y-2">
                <Clock className="w-8 h-8 text-white mx-auto mb-4" />
                <div className="text-5xl font-bold text-green-500-foreground">24/7</div>
                <div className="text-sm font-medium text-white ">خدمة العملاء</div>
                <div className="text-xs  text-white/70 text-pretty">دعم فني على مدار الساعة</div>
              </div>
            </Card>

            <Card className="bg-green-500-foreground/10 backdrop-blur-sm border-green-500-foreground/20 p-8 text-center hover:bg-green-500-foreground/15 transition-colors">
              <div className="space-y-2">
                <Award className="w-8 h-8 text-white mx-auto mb-4" />
                <div className="text-5xl font-bold text-green-500-foreground">98%</div>
                <div className="text-sm font-medium text-white ">رضا العملاء</div>
                <div className="text-xs  text-white/70 text-pretty">معدل رضا عملائنا عن خدماتنا</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Partnerships Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
          <Badge variant="outline" className="text-green-500 border-green-500/30">
            شركاؤنا
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">شراكات استراتيجية موثوقة</h2>
          <p className="text-muted-foreground text-lg text-pretty leading-relaxed">
            نتعاون مع أبرز الشركات والمؤسسات في مجال السلامة المرورية لتقديم أفضل الخدمات
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto">
          <Badge className="bg-green-500 text-white hover:bg-green-500/90 px-6 py-3 text-sm rounded-full">
            <CheckCircle className="w-4 h-4 ml-2" />
            منصة الفحص الفني الدوري
          </Badge>
          <Badge variant="outline" className="border-border hover:bg-accent px-6 py-3 text-sm rounded-full">
            الرقم الموحد
          </Badge>
          <Badge variant="outline" className="border-border hover:bg-accent px-6 py-3 text-sm rounded-full">
            More Book
          </Badge>
          <Badge variant="outline" className="border-border hover:bg-accent px-6 py-3 text-sm rounded-full">
            برنامج حماية
          </Badge>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border py-8 text-center">
        <div className="container mx-auto px-6">
          <p className="text-sm text-muted-foreground">© 2025 مركز السلامة للفحص الفني الدوري. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  )
}

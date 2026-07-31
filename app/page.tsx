export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import Gallery from '@/app/components/Gallery'

export default async function Home() {
  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .order('created_at', { ascending: false })

const heroPhoto = photos?.find((p) => p.slot === 'hero') ?? photos?.[0]
  const aboutPhoto = photos?.find((p) => p.slot === 'about') ?? photos?.[1]

  return (
    <main className="bg-[#0e0d0b] text-[#f3ede2]">
      <section className="relative h-screen flex items-end overflow-hidden">
        {heroPhoto ? (
          <img
            src={heroPhoto.url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1512] to-[#0e0d0b]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0d0b] via-[#0e0d0b]/40 to-transparent" />
        <div className="relative z-10 px-6 md:px-16 pb-20 md:pb-28">
          <p className="font-label text-xs tracking-[0.3em] text-[#c9a15a] mb-4">FOTO BY</p>
          <h1 className="font-brand text-6xl md:text-8xl leading-none mb-4">
            KLIMENKO
          </h1>
          <p style={{ fontFamily: 'Masvol' }} className="max-w-md text-[#c9c4b8] text-lg" >
            Свет, тишина и мгновение, которое не повторится дважды.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-16 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
        <div>
          <p className="font-label text-xs tracking-[0.3em] text-[#c9a15a] mb-6">О СЕБЕ</p>
          <p className="font-display italic text-2xl md:text-3xl leading-relaxed mb-6 text-[#f3ede2]">
            «Я не ловлю красивые лица — я ловлю правду момента, который иначе бы исчез незамеченным.»
          </p>
          <p style={{ fontFamily: 'Masvol', fontSize: '1.125rem' }} className="text-[#a8a296] leading-relaxed">
            Снимаю искренние истории без постановки и лишнего пафоса. В кадре — живые эмоции, настоящие улыбки и те моменты, которые хочется пересматривать снова. Доверие на съёмке — главное, и я всегда берегу его.
          </p>
        </div>
        {aboutPhoto && (
          <img
            src={aboutPhoto.url}
            alt=""
            className="w-full h-[420px] object-cover rounded-sm"
          />
        )}
      </section>

      <section className="px-6 md:px-16 py-16 md:py-24 max-w-7xl mx-auto">
        <p className="font-label text-xs tracking-[0.3em] text-[#c9a15a] mb-10">РАБОТЫ</p>
        <Gallery photos={photos ?? []} />
      </section>

      <section className="px-6 md:px-16 py-24 md:py-32 border-t border-[#2a2621] max-w-6xl mx-auto">
        <p className="font-label text-xs tracking-[0.3em] text-[#c9a15a] mb-6">СВЯЗАТЬСЯ</p>
        <h2 className="font-display text-4xl md:text-5xl font-light mb-10 max-w-xl">
          Расскажите о своей истории — я помогу её сохранить.
        </h2>
        <div className="flex flex-wrap gap-x-12 gap-y-4 text-lg">
          <a href="https://t.me/moliysd" className="border-b border-[#c9a15a]/40 hover:border-[#c9a15a] transition-colors">
            ТГ @moliysd
          </a>
          <a href="tel:+70000000000" className="border-b border-[#c9a15a]/40 hover:border-[#c9a15a] transition-colors">
            +7 959 138 8032
          </a>
          <a href="https://t.me/fotoluganskmoli" target="_blank" className="border-b border-[#c9a15a]/40 hover:border-[#c9a15a] transition-colors">
            Телеграмм канал 
          </a>
        </div>
      </section>

      <footer className="px-6 md:px-16 py-8 text-[#6b6862] text-sm font-label">
        © {new Date().getFullYear()} KLIMENKO
      </footer>
    </main>
  )
}
'use client'

import { useState, useEffect, useRef } from 'react'

type Photo = {
  id: string
  url: string
  category: string
}

const CATEGORIES = [
  { key: 'все', label: 'Все' },
  { key: 'свадьбы', label: 'Мероприятия' },
  { key: 'портреты', label: 'Портреты' },
  { key: 'семейные', label: 'Семейные' },
  { key: 'общее', label: 'Общее' },
]

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function Gallery({ photos }: { photos: Photo[] }) {
  const [active, setActive] = useState('все')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [shuffled, setShuffled] = useState<Photo[]>(photos)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- намеренно: перемешиваем только после монтирования в браузере, чтобы избежать несовпадения между сервером и клиентом
    setShuffled(shuffle(photos))
  }, [photos])

  const filtered =
    active === 'все' ? shuffled : shuffled.filter((p) => p.category === active)

  const selected = selectedIndex !== null ? filtered[selectedIndex] : null

  const showPrev = () => {
    if (selectedIndex === null) return
    setSelectedIndex((selectedIndex - 1 + filtered.length) % filtered.length)
  }

  const showNext = () => {
    if (selectedIndex === null) return
    setSelectedIndex((selectedIndex + 1) % filtered.length)
  }

  useEffect(() => {
    if (selectedIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') showPrev()
      if (e.key === 'ArrowRight') showNext()
      if (e.key === 'Escape') setSelectedIndex(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedIndex, filtered.length])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) showPrev()
      else showNext()
    }
    touchStartX.current = null
  }

  return (
    <div>
      <div className="flex gap-x-6 md:gap-x-8 gap-y-3 mb-8 md:mb-12 overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0 no-scrollbar">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => {
              setActive(c.key)
              setSelectedIndex(null)
            }}
            className={`font-label text-xs tracking-[0.2em] uppercase pb-1 border-b transition-colors whitespace-nowrap shrink-0 ${
              active === c.key
                ? 'text-[#c9a15a] border-[#c9a15a]'
                : 'text-[#6b6862] border-transparent hover:text-[#a8a296]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-[#6b6862]">В этой категории пока нет фото.</p>
      )}

      <div className="columns-2 md:columns-3 gap-3 md:gap-8 [column-fill:_balance]">
        {filtered.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setSelectedIndex(i)}
            className="group relative block w-full mb-3 md:mb-8 break-inside-avoid text-left"
          >
            <div className="relative overflow-hidden border border-[#2a2621]">
              <span className="absolute top-1.5 left-1.5 md:top-2 md:left-2 z-10 font-label text-[9px] md:text-[10px] text-[#c9a15a]/80 bg-[#0e0d0b]/60 px-1 py-0.5 md:px-1.5">
                {String(i + 1).padStart(3, '0')}
              </span>
              <img
                src={photo.url}
                alt={photo.category}
                className="w-full h-auto object-cover grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
              />
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div
          onClick={() => setSelectedIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="fixed inset-0 z-50 bg-[#0e0d0b]/95 flex items-center justify-center p-4 md:p-12 cursor-zoom-out touch-pan-y"
        >
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 md:top-6 md:right-6 font-label text-xs md:text-sm text-[#c9c4b8] hover:text-[#c9a15a] tracking-[0.2em] uppercase z-10 p-2"
          >
            Закрыть ✕
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              showPrev()
            }}
            className="hidden sm:flex absolute left-2 md:left-8 top-1/2 -translate-y-1/2 text-3xl text-[#c9c4b8] hover:text-[#c9a15a] px-3 py-4 z-10"
          >
            ‹
          </button>

          <img
            src={selected.url}
            alt={selected.category}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] object-contain"
          />

          <button
            onClick={(e) => {
              e.stopPropagation()
              showNext()
            }}
            className="hidden sm:flex absolute right-2 md:right-8 top-1/2 -translate-y-1/2 text-3xl text-[#c9c4b8] hover:text-[#c9a15a] px-3 py-4 z-10"
          >
            ›
          </button>

          <p className="sm:hidden absolute bottom-6 left-1/2 -translate-x-1/2 font-label text-[10px] tracking-[0.2em] uppercase text-[#6b6862]">
            ← Листайте свайпом →
          </p>
        </div>
      )}
    </div>
  )
}
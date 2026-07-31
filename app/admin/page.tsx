'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Photo = {
  id: string
  url: string
  category: string
  slot: string | null
}

export default function Admin() {
  const [checking, setChecking] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [category, setCategory] = useState('свадьбы')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const router = useRouter()

  const loadPhotos = async () => {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setMessage('Ошибка загрузки списка: ' + error.message)
      return
    }
    if (data) setPhotos(data)
  }

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push('/login')
      } else {
        setChecking(false)
        loadPhotos()
      }
    }
    checkAuth()
  }, [router])

  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    setPendingFiles((prev) => [...prev, ...Array.from(files)])
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return
    setPendingFiles((prev) => [...prev, ...Array.from(files)])
  }

  const removePending = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleConfirmUpload = async () => {
    if (pendingFiles.length === 0) return

    setUploading(true)
    setMessage('')

    try {
      let successCount = 0
      const errors: string[] = []

      for (const file of pendingFiles) {
        const fileExt = file.name.split('.').pop()
        const safeName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[^a-zA-Z0-9]/g, '-')
          .toLowerCase()
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, file)

        if (uploadError) {
          errors.push(`${file.name}: ${uploadError.message}`)
          continue
        }

        const { data: urlData } = supabase.storage
          .from('photos')
          .getPublicUrl(fileName)

        const { error: dbError } = await supabase
          .from('photos')
          .insert({ url: urlData.publicUrl, category })

        if (dbError) {
          errors.push(`${file.name}: ${dbError.message}`)
        } else {
          successCount++
        }
      }

      if (errors.length === 0) {
        setMessage(`Загружено фото: ${successCount}`)
      } else {
        setMessage(`Загружено: ${successCount}. Ошибки: ${errors.join(' | ')}`)
      }

      setPendingFiles([])
      loadPhotos()
    } catch (err) {
      setMessage('Неожиданная ошибка: ' + (err instanceof Error ? err.message : String(err)))
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (photo: Photo) => {
    const confirmed = window.confirm('Удалить это фото?')
    if (!confirmed) return

    const fileName = photo.url.split('/photos/').pop()

    if (fileName) {
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove([fileName])

      if (storageError) {
        alert('Ошибка удаления файла: ' + storageError.message)
        return
      }
    }

    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photo.id)

    if (dbError) {
      alert('Ошибка удаления записи: ' + dbError.message)
      return
    }

    setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
  }

  const handleSetSlot = async (photo: Photo, slot: 'hero' | 'about') => {
    // Сначала снимаем этот слот с фото, у которого он был раньше
    await supabase.from('photos').update({ slot: null }).eq('slot', slot)

    // Затем ставим его текущему фото
    const { error } = await supabase
      .from('photos')
      .update({ slot })
      .eq('id', photo.id)

    if (error) {
      alert('Ошибка: ' + error.message)
      return
    }

    loadPhotos()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Проверка входа...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold">Загрузка фото</h1>
        <button onClick={handleLogout} className="text-gray-400 underline">
          Выйти
        </button>
      </div>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full p-3 mb-6 rounded bg-gray-900 border border-gray-700 text-white"
      >
        <option value="свадьбы">Свадьбы</option>
        <option value="портреты">Портреты</option>
        <option value="семейные">Семейные</option>
        <option value="общее">Общее</option>
      </select>

      <label
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="block border-2 border-dashed border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400"
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleSelectFiles}
          className="hidden"
          disabled={uploading}
        />
        <p className="text-gray-400">
          Перетащите фото сюда или нажмите, чтобы выбрать
        </p>
      </label>

      {pendingFiles.length > 0 && (
        <div className="mt-8">
          <p className="text-gray-400 mb-3">
            Готово к загрузке: {pendingFiles.length}
          </p>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-4">
            {pendingFiles.map((file, i) => (
              <div key={i} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-32 object-cover rounded"
                />
                <button
                  onClick={() => removePending(i)}
                  className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleConfirmUpload}
            disabled={uploading}
            className="w-full p-3 rounded bg-white text-black font-semibold disabled:opacity-50"
          >
            {uploading ? 'Загружаю...' : `Загрузить (${pendingFiles.length})`}
          </button>
        </div>
      )}

      {message && <p className="mt-6 whitespace-pre-wrap">{message}</p>}

      <div className="mt-14">
        <h2 className="text-xl font-bold mb-4">Загруженные фото</h2>
        {photos.length === 0 && <p className="text-gray-500">Пока пусто.</p>}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative">
              <img
                src={photo.url}
                alt={photo.category}
                className="w-full h-32 object-cover rounded"
              />
              <button
                onClick={() => handleDelete(photo)}
                className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded"
              >
                Удалить
              </button>

              {photo.slot && (
                <span className="absolute top-1 left-1 bg-yellow-500 text-black text-xs px-2 py-1 rounded font-semibold">
                  {photo.slot === 'hero' ? 'Фон' : 'О себе'}
                </span>
              )}

              <div className="flex gap-1 mt-1">
                <button
                  onClick={() => handleSetSlot(photo, 'hero')}
                  className="flex-1 bg-gray-800 text-white text-xs px-1 py-1 rounded"
                >
                  На фон
                </button>
                <button
                  onClick={() => handleSetSlot(photo, 'about')}
                  className="flex-1 bg-gray-800 text-white text-xs px-1 py-1 rounded"
                >
                  О себе
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
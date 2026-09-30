import { useState } from 'react'

type Props = {
  onSend: (text: string) => Promise<void>
}

export function MessageInput({ onSend }: Props) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  async function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setSending(true)
    setError(null)
    try {
      await onSend(trimmed)
      setText('')
    } catch {
      setError('Не удалось отправить сообщение')
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-slate-200 bg-white p-3">
      {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
      <div className="flex items-end gap-2">
        <textarea
          rows={1}
          className="min-w-0 flex-1 resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          placeholder="Сообщение..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-40"
        >
          Отправить
        </button>
      </div>
    </div>
  )
}

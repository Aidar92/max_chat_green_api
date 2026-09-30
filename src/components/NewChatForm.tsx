import { useState } from 'react'
import { checkAccount, normalizePhoneDigits } from '../api/greenApi'
import { useChat } from '../context/ChatContext'

export function NewChatForm() {
  const { state, dispatch } = useChat()
  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const digits = normalizePhoneDigits(phone)
    if (digits.length < 5 || !state.credentials || loading) return

    setLoading(true)
    setError(null)
    try {
      const result = await checkAccount(state.credentials, digits)
      if (!result.exist || !result.chatId) {
        setError('Аккаунт MAX для этого номера не найден')
        return
      }
      dispatch({ type: 'ADD_CHAT', chatId: result.chatId, phone: digits })
      dispatch({ type: 'SET_ACTIVE_CHAT', chatId: result.chatId })
      setPhone('')
      setOpen(false)
    } catch {
      setError('Не удалось проверить номер')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border-b border-slate-100 px-4 py-3 text-left text-sm font-medium text-blue-600 hover:bg-slate-50"
      >
        + Новый чат
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="border-b border-slate-100 p-3">
      <div className="flex gap-2">
        <input
          autoFocus
          className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-blue-500"
          placeholder="+79991234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-40"
        >
          {loading ? '...' : 'OK'}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </form>
  )
}

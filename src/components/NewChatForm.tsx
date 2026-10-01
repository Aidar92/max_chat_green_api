import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import * as greenApi from '../api/greenApi'
import { useChat } from '../context/ChatContext'

export function NewChatForm() {
  const { state, dispatch } = useChat()
  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [notFound, setNotFound] = useState(false)

  const checkAccount = useMutation({
    mutationFn: (digits: string) => greenApi.controller.checkAccount(state.credentials!, digits),
  })

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    const digits = greenApi.normalizePhoneDigits(phone)
    if (digits.length < 5 || !state.credentials || checkAccount.isPending) return

    setNotFound(false)
    const result = await checkAccount.mutateAsync(digits).catch(() => null)
    if (!result) return

    if (!result.exist || !result.chatId) {
      setNotFound(true)
      return
    }

    dispatch({ type: 'ADD_CHAT', chatId: result.chatId, phone: digits })
    dispatch({ type: 'SET_ACTIVE_CHAT', chatId: result.chatId })
    setPhone('')
    setOpen(false)
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
          type='tel'
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button
          type="submit"
          disabled={checkAccount.isPending}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-40"
        >
          {checkAccount.isPending ? '...' : 'OK'}
        </button>
      </div>
      {notFound && <p className="mt-2 text-xs text-red-500">Аккаунт MAX для этого номера не найден</p>}
      {checkAccount.isError && <p className="mt-2 text-xs text-red-500">Не удалось проверить номер</p>}
    </form>
  )
}

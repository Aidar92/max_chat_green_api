import { useState } from 'react'
import { useChat } from '../context/ChatContext'

export function LoginScreen() {
  const { login } = useChat()
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')

  const canSubmit = idInstance.trim().length > 0 && apiTokenInstance.trim().length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    login({ idInstance: idInstance.trim(), apiTokenInstance: apiTokenInstance.trim() })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <form onSubmit={handleSubmit} className="w-80 space-y-4 rounded-xl bg-white p-6 shadow-md">
        <h1 className="text-lg font-semibold text-slate-800">Вход в MAX чат</h1>
        <div className="space-y-1">
          <label className="text-sm text-slate-600">idInstance</label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            placeholder="1101000001"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-slate-600">apiTokenInstance</label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            type="password"
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            placeholder="d3b8...token"
          />
        </div>
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Войти
        </button>
      </form>
    </div>
  )
}

import type { Chat } from '../types'

type Props = {
  chat: Chat
  active: boolean
  onSelect: () => void
}

export function ChatListItem({ chat, active, onSelect }: Props) {
  const lastMessage = chat.messages[chat.messages.length - 1]

  return (
    <button
      onClick={onSelect}
      className={`flex w-full flex-col items-start gap-0.5 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 ${
        active ? 'bg-blue-50' : ''
      }`}
    >
      <span className="text-sm font-medium text-slate-800">{chat.phone}</span>
      <span className="w-full truncate text-xs text-slate-500">{lastMessage?.text ?? 'Нет сообщений'}</span>
    </button>
  )
}

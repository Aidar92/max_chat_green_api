import { useChat } from '../context/ChatContext'
import { ChatListItem } from './ChatListItem'
import { NewChatForm } from './NewChatForm'

export function ChatSidebar() {
  const { state, dispatch, logout } = useChat()
  const chatEntries = Object.entries(state.chats)

  return (
    <div className="flex h-full w-80 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <span className="text-sm font-semibold text-slate-800">Чаты MAX</span>
        <button onClick={logout} className="text-xs text-slate-400 hover:text-slate-600">
          Выйти
        </button>
      </div>
      <NewChatForm />
      <div className="flex-1 overflow-y-auto">
        {chatEntries.length === 0 && <p className="p-4 text-sm text-slate-400">Пока нет чатов</p>}
        {chatEntries.map(([key, chat]) => (
          <ChatListItem
            key={key}
            chat={chat}
            active={key === state.activeChatId}
            onSelect={() => dispatch({ type: 'SET_ACTIVE_CHAT', chatId: chat.chatId })}
          />
        ))}
      </div>
    </div>
  )
}

import { sendMessage } from '../api/greenApi'
import { useChat } from '../context/ChatContext'
import { MessageInput } from './MessageInput'
import { MessageList } from './MessageList'

export function ChatWindow() {
  const { state, dispatch } = useChat()
  const chat = state.activeChatId ? state.chats[state.activeChatId] : null

  if (!chat || !state.credentials) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50 text-sm text-slate-400">
        Выберите чат слева или создайте новый
      </div>
    )
  }

  async function handleSend(text: string) {
    await sendMessage(state.credentials!, chat!.chatId, text)
    dispatch({
      type: 'APPEND_MESSAGE',
      chatId: chat!.chatId,
      message: { id: crypto.randomUUID(), text, direction: 'out', timestamp: Date.now() },
    })
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <span className="text-sm font-semibold text-slate-800">{chat.phone}</span>
      </div>
      <MessageList messages={chat.messages} />
      <MessageInput onSend={handleSend} />
    </div>
  )
}

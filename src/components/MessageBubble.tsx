import type { Message } from '../types'

export function MessageBubble({ message }: { message: Message }) {
  const isOut = message.direction === 'out'
  return (
    <div className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs rounded-2xl px-4 py-2 text-sm break-words ${
          isOut ? 'bg-blue-600 text-white' : 'bg-white text-slate-800'
        }`}
      >
        {message.text}
      </div>
    </div>
  )
}

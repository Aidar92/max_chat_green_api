import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import type { Chat, ConnectionStatus, Credentials, Message } from '../types'

const SESSION_KEY = 'max-chat-credentials'

type State = {
  credentials: Credentials | null
  status: ConnectionStatus
  errorMessage: string | null
  chats: Record<string, Chat>
  activeChatId: string | null
}

type Action =
  | { type: 'LOGIN'; credentials: Credentials }
  | { type: 'LOGOUT' }
  | { type: 'SET_STATUS'; status: ConnectionStatus; errorMessage?: string | null }
  | { type: 'ADD_CHAT'; chatId: string; phone: string }
  | { type: 'SET_ACTIVE_CHAT'; chatId: string }
  | { type: 'APPEND_MESSAGE'; chatId: string; phone?: string; message: Message }

function readStoredCredentials(): Credentials | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Credentials) : null
  } catch {
    return null
  }
}

const storedCredentials = readStoredCredentials()

const initialState: State = {
  credentials: storedCredentials,
  status: storedCredentials ? 'connected' : 'loggedOut',
  errorMessage: null,
  chats: {},
  activeChatId: null,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, credentials: action.credentials, status: 'connected', errorMessage: null }
    case 'LOGOUT':
      return { ...initialState, credentials: null, status: 'loggedOut' }
    case 'SET_STATUS':
      return { ...state, status: action.status, errorMessage: action.errorMessage ?? null }
    case 'ADD_CHAT': {
      if (state.chats[action.chatId]) return state
      return {
        ...state,
        chats: {
          ...state.chats,
          [action.chatId]: { chatId: action.chatId, phone: action.phone, messages: [] },
        },
      }
    }
    case 'SET_ACTIVE_CHAT':
      return { ...state, activeChatId: action.chatId }
    case 'APPEND_MESSAGE': {
      const existing = state.chats[action.chatId]
      const chat: Chat = existing ?? {
        chatId: action.chatId,
        phone: action.phone ?? action.chatId,
        messages: [],
      }
      return {
        ...state,
        chats: {
          ...state.chats,
          [action.chatId]: { ...chat, messages: [...chat.messages, action.message] },
        },
      }
    }
    default:
      return state
  }
}

type ChatContextValue = {
  state: State
  dispatch: React.Dispatch<Action>
  login: (credentials: Credentials) => void
  logout: () => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (state.credentials) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(state.credentials))
    } else {
      sessionStorage.removeItem(SESSION_KEY)
    }
  }, [state.credentials])

  const login = (credentials: Credentials) => dispatch({ type: 'LOGIN', credentials })
  const logout = () => dispatch({ type: 'LOGOUT' })

  return <ChatContext.Provider value={{ state, dispatch, login, logout }}>{children}</ChatContext.Provider>
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}

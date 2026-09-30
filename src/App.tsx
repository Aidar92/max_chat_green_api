import { ChatProvider, useChat } from './context/ChatContext'
import { useGreenApiNotifications } from './hooks/useGreenApiNotifications'
import { LoginScreen } from './components/LoginScreen'
import { ChatSidebar } from './components/ChatSidebar'
import { ChatWindow } from './components/ChatWindow'

function AppContent() {
  const { state } = useChat()
  useGreenApiNotifications(state.status === 'error' ? null : state.credentials)

  if (state.status === 'loggedOut' || !state.credentials) {
    return <LoginScreen />
  }

  return (
    <div className="flex h-screen flex-col">
      {state.status === 'error' && (
        <div className="bg-red-500 px-4 py-2 text-center text-sm text-white">
          {state.errorMessage ?? 'Ошибка соединения с GREEN-API'} — проверьте idInstance/apiTokenInstance и войдите заново
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar />
        <ChatWindow />
      </div>
    </div>
  )
}

function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  )
}

export default App

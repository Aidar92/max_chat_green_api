import { useEffect } from 'react'
import { deleteNotification, GreenApiError, receiveNotification } from '../api/greenApi'
import type { Credentials, Message } from '../types'
import { useChat } from '../context/ChatContext'

const BASE_DELAY_MS = 2000
const MAX_DELAY_MS = 10000

export function useGreenApiNotifications(credentials: Credentials | null) {
  const { dispatch } = useChat()

  useEffect(() => {
    if (!credentials) return
    const creds = credentials

    let cancelled = false
    const controller = new AbortController()
    let timeoutId: ReturnType<typeof setTimeout>
    let retryDelay = BASE_DELAY_MS
    let consecutiveAuthErrors = 0

    async function pollOnce() {
      try {
        const notification = await receiveNotification(creds, 5, controller.signal)
        retryDelay = BASE_DELAY_MS
        consecutiveAuthErrors = 0

        if (notification) {
          const { receiptId, body } = notification
          console.debug('[GREEN-API] notification received:', body)

          const chatId = body.senderData?.chatId
          const text = body.messageData?.textMessageData?.textMessage
          const isIncoming = body.typeWebhook?.toLowerCase().startsWith('incoming')

          if (chatId && text && isIncoming) {
            const message: Message = {
              id: body.idMessage ?? String(receiptId),
              text,
              direction: 'in',
              timestamp: body.timestamp * 1000,
            }
            dispatch({
              type: 'APPEND_MESSAGE',
              chatId,
              phone: body.senderData?.senderName ?? chatId,
              message,
            })
          }

          await deleteNotification(creds, receiptId)
        }
      } catch (err) {
        if (cancelled) return

        if (err instanceof GreenApiError && err.status === 401) {
          consecutiveAuthErrors += 1
          if (consecutiveAuthErrors >= 2) {
            dispatch({ type: 'SET_STATUS', status: 'error', errorMessage: 'Неверные учётные данные GREEN-API' })
            return
          }
        } else {
          console.debug('[GREEN-API] poll error, backing off:', err)
          retryDelay = Math.min(retryDelay * 2, MAX_DELAY_MS)
        }
      }

      if (!cancelled) {
        timeoutId = setTimeout(pollOnce, retryDelay)
      }
    }

    pollOnce()

    return () => {
      cancelled = true
      controller.abort()
      clearTimeout(timeoutId)
    }
  }, [credentials, dispatch])
}

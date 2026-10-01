import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as greenApi from '../api/greenApi'
import type { Credentials, Message } from '../types'
import { useChat } from '../context/ChatContext'

const BASE_DELAY_MS = 2000
const MAX_DELAY_MS = 10000

export function useGreenApiNotifications(credentials: Credentials | null) {
  const { dispatch } = useChat()
  const consecutiveAuthErrorsRef = useRef(0)

  const query = useQuery({
    queryKey: ['greenApi', 'notification', credentials?.idInstance, credentials?.apiTokenInstance],
    enabled: !!credentials,
    retry: false,
    refetchIntervalInBackground: true,
    // Long-poll queue: keep re-checking on a short cadence, backing off while it errors.
    refetchInterval: (q) =>
      q.state.status === 'error' ? Math.min(BASE_DELAY_MS * 2 ** q.state.errorUpdateCount, MAX_DELAY_MS) : BASE_DELAY_MS,
    queryFn: async ({ signal }) => {
      // `enabled` guarantees this only runs while credentials is set.
      const creds = credentials as Credentials
      const notification = await greenApi.controller.receiveNotification(creds, 5, signal)
      if (!notification) return null

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

      await greenApi.controller.deleteNotification(creds, receiptId)
      return notification
    },
  })

  useEffect(() => {
    if (query.isSuccess) {
      consecutiveAuthErrorsRef.current = 0
      return
    }

    if (query.error instanceof greenApi.GreenApiError && query.error.status === 401) {
      consecutiveAuthErrorsRef.current += 1
      if (consecutiveAuthErrorsRef.current >= 2) {
        dispatch({ type: 'SET_STATUS', status: 'error', errorMessage: 'Неверные учётные данные GREEN-API' })
      }
    } else if (query.isError) {
      console.debug('[GREEN-API] poll error, backing off:', query.error)
    }
  }, [query.isSuccess, query.isError, query.error, dispatch])
}

import ky, { HTTPError } from 'ky'
import type { Credentials, GreenApiNotification } from '../types'

export class GreenApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export type CheckAccountResult = { exist: boolean; chatId: string }
export type SendMessageResult = { idMessage: string }

const kyInstance = ky.extend({ retry: 0 })

function instanceUrl(creds: Credentials, method: string) {
  const subdomain = creds.idInstance.slice(0, 4)
  return `https://${subdomain}.api.green-api.com/waInstance${creds.idInstance}/${method}/${creds.apiTokenInstance}`
}

async function toGreenApiError(err: unknown): Promise<never> {
  if (err instanceof HTTPError) {
    const body = await err.response.text().catch(() => '')
    const detail = body ? ` - ${body}` : ''
    throw new GreenApiError(err.response.status, `GREEN-API ${err.response.status}: ${err.response.statusText}${detail}`)
  }
  throw err
}

export function normalizePhoneDigits(rawPhone: string): string {
  const digits = rawPhone.replace(/[^\d]/g, '')
  return digits.length === 11 && digits.startsWith('8') ? `7${digits.slice(1)}` : digits
}

export const controller = {
  checkAccount: (creds: Credentials, phoneDigits: string): Promise<CheckAccountResult> =>
    kyInstance
      .post(instanceUrl(creds, 'checkAccount'), { json: { phoneNumber: Number(phoneDigits) } })
      .json<CheckAccountResult>()
      .catch(toGreenApiError),

  sendMessage: (creds: Credentials, chatId: string, message: string): Promise<SendMessageResult> =>
    kyInstance
      .post(instanceUrl(creds, 'sendMessage'), { json: { chatId, message } })
      .json<SendMessageResult>()
      .catch(toGreenApiError),

  receiveNotification: async (
    creds: Credentials,
    receiveTimeout = 5,
    signal?: AbortSignal,
  ): Promise<GreenApiNotification | null> => {
    try {
      const response = await kyInstance.get(instanceUrl(creds, 'receiveNotification'), {
        searchParams: { receiveTimeout },
        timeout: (receiveTimeout + 10) * 1000,
        signal,
      })
      if (response.status === 204) return null
      const text = await response.text()
      return text ? JSON.parse(text) : null
    } catch (err) {
      return toGreenApiError(err)
    }
  },

  deleteNotification: (creds: Credentials, receiptId: number): Promise<void> =>
    kyInstance
      .delete(`${instanceUrl(creds, 'deleteNotification')}/${receiptId}`)
      .then(() => undefined)
      .catch(toGreenApiError),
}

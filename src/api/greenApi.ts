import type { Credentials, GreenApiNotification } from '../types'

class GreenApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function instanceUrl(creds: Credentials, method: string, suffix = '') {
  const subdomain = creds.idInstance.slice(0, 4)
  return `https://${subdomain}.api.green-api.com/waInstance${creds.idInstance}/${method}/${creds.apiTokenInstance}${suffix}`
}

async function assertOk(response: Response) {
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    const detail = body ? ` - ${body}` : ''
    throw new GreenApiError(response.status, `GREEN-API ${response.status}: ${response.statusText}${detail}`)
  }
}

export { GreenApiError }

// MAX chatId is a server-assigned opaque id (e.g. "10000000"), not derived from the phone
// number - it must be resolved via CheckAccount before sending/creating a chat.
export function normalizePhoneDigits(rawPhone: string): string {
  const digits = rawPhone.replace(/[^\d]/g, '')
  return digits.length === 11 && digits.startsWith('8') ? `7${digits.slice(1)}` : digits
}

export async function checkAccount(
  creds: Credentials,
  phoneDigits: string,
): Promise<{ exist: boolean; chatId: string }> {
  const response = await fetch(instanceUrl(creds, 'checkAccount'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: Number(phoneDigits) }),
  })
  await assertOk(response)
  return response.json()
}

export async function sendMessage(
  creds: Credentials,
  chatId: string,
  message: string,
): Promise<{ idMessage: string }> {
  const response = await fetch(instanceUrl(creds, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })
  await assertOk(response)
  return response.json()
}

export async function receiveNotification(
  creds: Credentials,
  receiveTimeout = 5,
  signal?: AbortSignal,
): Promise<GreenApiNotification | null> {
  const response = await fetch(instanceUrl(creds, 'receiveNotification', `?receiveTimeout=${receiveTimeout}`), {
    signal,
  })
  await assertOk(response)
  if (response.status === 204) return null
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function deleteNotification(creds: Credentials, receiptId: number): Promise<void> {
  const response = await fetch(instanceUrl(creds, 'deleteNotification', `/${receiptId}`), {
    method: 'DELETE',
  })
  await assertOk(response)
}

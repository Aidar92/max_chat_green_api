export type Credentials = {
  idInstance: string
  apiTokenInstance: string
}

export type Message = {
  id: string
  text: string
  direction: 'in' | 'out'
  timestamp: number
}

export type Chat = {
  chatId: string
  phone: string
  messages: Message[]
}

export type ConnectionStatus = 'loggedOut' | 'connected' | 'error'

export type GreenApiNotification = {
  receiptId: number
  body: {
    typeWebhook: string
    timestamp: number
    idMessage?: string
    senderData?: {
      chatId: string
      sender: string
      senderName?: string
    }
    messageData?: {
      typeMessage: string
      textMessageData?: {
        textMessage: string
      }
    }
  }
}

'use client'

import { useAuth } from '@/hooks/useAuth'
import { useChatContext } from '@/contexts/ChatContext'
import { ChatPopup } from './ChatPopup'

export function ChatPopupContainer() {
  const { tenant } = useAuth()
  const { isOpen, closeChat } = useChatContext()

  if (!tenant) return null

  return <ChatPopup tenantId={tenant.id} isOpen={isOpen} onClose={closeChat} />
}

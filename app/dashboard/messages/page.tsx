"use client"

import { useState, useRef, useEffect, type FormEvent } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Notification } from "@/components/ui/notification"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { io, Socket } from "socket.io-client"
import { 
  MessageSquare, 
  Send, 
  Search, 
  Paperclip, 
  Smile, 
  Phone, 
  Video,
  MoreVertical,
  Circle,
  Bell
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  receiverId: string
  message: string
  timestamp: string
  read: boolean
}

interface Conversation {
  partner_id: string
  partner_name: string
  last_message: string
  last_message_time: string
  is_read: boolean
  is_sent_by_me: boolean
}

interface User {
  id: string
  full_name: string
  email: string
  role: string
  status: string
  is_online: boolean
}

interface NotificationItem {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  timestamp: Date
}

export default function MessagesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [input, setInput] = useState("")
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Connect to socket.io on mount
  useEffect(() => {
    if (!user) return
    
    const sock = io({ path: "/api/socket/io" })
    setSocket(sock)
    sock.emit("join", user.id)
    
    return () => { 
      sock.disconnect() 
    }
  }, [user])

  // Load conversations and users
  useEffect(() => {
    if (!user) return
    
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load conversations
        const convResponse = await fetch(`/api/messages?userId=${user.id}`)
        const convData = await convResponse.json()
        if (convData.conversations) {
          setConversations(convData.conversations)
          // Calculate unread count
          const unread = convData.conversations.filter((c: Conversation) => !c.is_read && !c.is_sent_by_me).length
          setUnreadCount(unread)
        }
        
        // Load users
        const usersResponse = await fetch(`/api/users?currentUserId=${user.id}`)
        const usersData = await usersResponse.json()
        if (usersData.users) {
          setUsers(usersData.users)
        }
      } catch (error) {
        console.error('Error loading data:', error)
        addNotification("Error", "Failed to load conversations", "error")
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [user])

  // Handle URL parameter for direct chat
  useEffect(() => {
    const userId = searchParams.get("userId")
    if (userId) {
      setSelectedPartner(userId)
      loadMessages(userId)
    }
  }, [searchParams, user])

  // Load messages for selected partner
  const loadMessages = async (partnerId: string) => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/messages?userId=${user.id}&partnerId=${partnerId}`)
      const data = await response.json()
      if (data.messages) {
        setMessages(data.messages)
        // Mark messages as read
        await fetch('/api/messages', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, partnerId })
        })
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      addNotification("Error", "Failed to load messages", "error")
    }
  }

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return
    
    socket.on("message", (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg])
      // Update conversation list
      updateConversationList(msg)
      
      // Show notification if not in the current chat
      if (msg.senderId !== selectedPartner) {
        addNotification(
          "New Message", 
          `${msg.senderName}: ${msg.message.substring(0, 50)}${msg.message.length > 50 ? '...' : ''}`, 
          "info"
        )
        setUnreadCount(prev => prev + 1)
      }
    })
    
    socket.on("typing", (data) => {
      if (data.isTyping) {
        setTypingUsers(prev => new Set(prev).add(data.userId))
      } else {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(data.userId)
          return newSet
        })
      }
    })
    
    socket.on("user_status", (data) => {
      setUsers(prev => prev.map(u => 
        u.id === data.userId 
          ? { ...u, is_online: data.status === "online" }
          : u
      ))
    })
    
    socket.on("message_sent", (msg) => {
      addNotification("Success", "Message sent successfully", "success")
    })
    
    socket.on("message_error", (data) => {
      addNotification("Error", data.error || "Failed to send message", "error")
    })
    
    return () => {
      socket.off("message")
      socket.off("typing")
      socket.off("user_status")
      socket.off("message_sent")
      socket.off("message_error")
    }
  }, [socket, selectedPartner])

  // Add notification
  const addNotification = (title: string, message: string, type: "info" | "success" | "warning" | "error") => {
    const notification: NotificationItem = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date()
    }
    setNotifications(prev => [...prev, notification])
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }

  // Remove notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Update conversation list when new message arrives
  const updateConversationList = (msg: ChatMessage) => {
    setConversations(prev => {
      const existing = prev.find(c => c.partner_id === msg.senderId || c.partner_id === msg.receiverId)
      if (existing) {
        return prev.map(c => 
          c.partner_id === msg.senderId || c.partner_id === msg.receiverId
            ? { ...c, last_message: msg.message, last_message_time: msg.timestamp, is_read: false }
            : c
        )
      } else {
        // Add new conversation
        const partnerId = msg.senderId === user?.id ? msg.receiverId : msg.senderId
        const partnerName = msg.senderId === user?.id ? "Unknown" : msg.senderName
        return [{ 
          partner_id: partnerId,
          partner_name: partnerName,
          last_message: msg.message,
          last_message_time: msg.timestamp,
          is_read: false,
          is_sent_by_me: msg.senderId === user?.id
        }, ...prev]
      }
    })
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Send a message
  const sendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !selectedPartner || !user) return
    
    const messageData = {
      senderId: user.id,
      receiverId: selectedPartner,
      content: input
    }
    
    try {
      // Send via socket for real-time
      socket?.emit("message", messageData)
      setInput("")
      
      // Stop typing indicator
      socket?.emit("typing", { senderId: user.id, receiverId: selectedPartner, isTyping: false })
    } catch (error) {
      console.error('Error sending message:', error)
      addNotification("Error", "Failed to send message", "error")
    }
  }

  // Handle typing indicator
  const handleTyping = (isTyping: boolean) => {
    if (!socket || !selectedPartner || !user) return
    socket.emit("typing", { senderId: user.id, receiverId: selectedPartner, isTyping })
  }

  // Select a conversation
  const selectConversation = (partnerId: string) => {
    setSelectedPartner(partnerId)
    loadMessages(partnerId)
  }

  // Get partner name
  const getPartnerName = (partnerId: string) => {
    const conversation = conversations.find(c => c.partner_id === partnerId)
    const user = users.find(u => u.id === partnerId)
    return conversation?.partner_name || user ? `${user.full_name}` : "Unknown User"
  }

  // Get partner online status
  const getPartnerStatus = (partnerId: string) => {
    const user = users.find(u => u.id === partnerId)
    return user?.is_online || false
  }

  // Filter users and conversations based on search
  const filteredUsers = users.filter(u => 
    `${u.full_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredConversations = conversations.filter(c =>
    c.partner_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading messages...</div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            title={notification.title}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>

      <div className="flex h-[calc(100vh-100px)]">
        {/* Sidebar - Conversations and Users */}
        <div className="w-80 border-r flex flex-col">
          {/* Header with unread count */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Messages</h2>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Bell className="h-3 w-3" />
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-2">
                {filteredConversations.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">Recent Conversations</h3>
                    {filteredConversations.map((conv) => (
                      <div
                        key={conv.partner_id}
                        onClick={() => selectConversation(conv.partner_id)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors",
                          selectedPartner === conv.partner_id && "bg-muted"
                        )}
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {conv.partner_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {getPartnerStatus(conv.partner_id) && (
                            <Circle className="h-3 w-3 fill-green-500 text-green-500 absolute -bottom-0.5 -right-0.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate">{conv.partner_name}</h4>
                            <span className="text-xs text-muted-foreground">
                              {new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.is_sent_by_me ? "You: " : ""}{conv.last_message}
                          </p>
                        </div>
                        {!conv.is_read && !conv.is_sent_by_me && (
                          <div className="h-2 w-2 bg-primary rounded-full" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* All Users */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">All Users</h3>
                  {filteredUsers.map((userItem) => (
                    <div
                      key={userItem.id}
                      onClick={() => selectConversation(userItem.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors",
                        selectedPartner === userItem.id && "bg-muted"
                      )}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {`${userItem.full_name[0]}`.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {userItem.is_online && (
                          <Circle className="h-3 w-3 fill-green-500 text-green-500 absolute -bottom-0.5 -right-0.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{`${userItem.full_name}`}</h4>
                        <p className="text-sm text-muted-foreground truncate">{userItem.email}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{userItem.role}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedPartner ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {getPartnerName(selectedPartner).split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {getPartnerStatus(selectedPartner) && (
                      <Circle className="h-3 w-3 fill-green-500 text-green-500 absolute -bottom-0.5 -right-0.5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{getPartnerName(selectedPartner)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getPartnerStatus(selectedPartner) ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn("flex", msg.senderId === user?.id ? "justify-end" : "justify-start")}
                    >
                      <div className={cn(
                        "max-w-[70%] rounded-lg px-4 py-2",
                        msg.senderId === user?.id 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}>
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {typingUsers.has(selectedPartner) && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <p className="text-sm text-muted-foreground">Typing...</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <form onSubmit={sendMessage} className="flex items-center gap-2">
                  <Button type="button" size="sm" variant="ghost">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value)
                      handleTyping(e.target.value.length > 0)
                    }}
                    onBlur={() => handleTyping(false)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button type="button" size="sm" variant="ghost">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button type="submit" size="sm" disabled={!input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">Choose a user to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

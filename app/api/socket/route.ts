import { Server } from "socket.io"
import { NextApiRequest } from "next"
import { execute } from '@/lib/db'

export const config = {
  api: {
    bodyParser: false,
  },
}

let io: Server | undefined
const onlineUsers = new Map<string, string>() // userId -> socketId

export default function handler(req: NextApiRequest, res: any) {
  if (!res.socket.server.io) {
    io = new Server(res.socket.server, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    })
    res.socket.server.io = io

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id)

      // Join user room and track online status
      socket.on("join", async (userId) => {
        socket.join(userId)
        onlineUsers.set(userId, socket.id)
        
        // Update last_login in database
        try {
          await execute(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [userId]
          )
        } catch (error) {
          console.error('Error updating last_login:', error)
        }

        // Broadcast online status to all users
        io?.emit("user_status", { userId, status: "online" })
      })

      // Handle sending a message
      socket.on("message", async (msg) => {
        try {
          // Save message to database
          const [result] = await execute(
            'INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at) VALUES (?, ?, ?, 0, NOW())',
            [msg.senderId, msg.receiverId, msg.content]
          )

          // Get the saved message with user details
          const [messages] = await execute(
            `SELECT m.*, 
             u1.full_name as sender_full_name,
             u2.full_name as receiver_full_name
             FROM messages m
             JOIN users u1 ON m.sender_id = u1.id
             JOIN users u2 ON m.receiver_id = u2.id
             WHERE m.id = ?`,
            [(result as any).insertId]
          )

          const savedMessage = messages[0]
          
          // Emit to receiver
          io?.to(msg.receiverId).emit("message", {
            id: savedMessage.id,
            senderId: savedMessage.sender_id,
            senderName: savedMessage.sender_full_name,
            receiverId: savedMessage.receiver_id,
            message: savedMessage.content,
            timestamp: savedMessage.created_at,
            read: savedMessage.is_read === 1
          })

          // Emit back to sender for confirmation
          socket.emit("message_sent", {
            id: savedMessage.id,
            senderId: savedMessage.sender_id,
            senderName: savedMessage.sender_full_name,
            receiverId: savedMessage.receiver_id,
            message: savedMessage.content,
            timestamp: savedMessage.created_at,
            read: savedMessage.is_read === 1
          })

        } catch (error) {
          console.error('Error saving message:', error)
          socket.emit("message_error", { error: "Failed to send message" })
        }
      })

      // Handle typing indicator
      socket.on("typing", (data) => {
        socket.to(data.receiverId).emit("typing", {
          userId: data.senderId,
          isTyping: data.isTyping
        })
      })

      // Handle message read status
      socket.on("mark_read", async (data) => {
        try {
          await execute(
            'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0',
            [data.senderId, data.receiverId]
          )
          
          // Notify sender that messages were read
          io?.to(data.senderId).emit("messages_read", {
            readerId: data.receiverId
          })
        } catch (error) {
          console.error('Error marking messages as read:', error)
        }
      })

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id)
        
        // Remove from online users
        let disconnectedUserId: string | undefined
        for (const [userId, socketId] of onlineUsers.entries()) {
          if (socketId === socket.id) {
            disconnectedUserId = userId
            break
          }
        }
        
        if (disconnectedUserId) {
          onlineUsers.delete(disconnectedUserId)
          // Broadcast offline status
          io?.emit("user_status", { userId: disconnectedUserId, status: "offline" })
        }
      })
    })
  }
  res.end()
}

import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'

// GET /api/messages - Get conversations for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const partnerId = searchParams.get('partnerId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (partnerId) {
      // Get messages between two specific users
      const [messages] = await execute(
        `SELECT m.*, 
         u1.full_name as sender_full_name,
         u2.full_name as receiver_full_name
         FROM messages m
         JOIN users u1 ON m.sender_id = u1.id
         JOIN users u2 ON m.receiver_id = u2.id
         WHERE (m.sender_id = ? AND m.receiver_id = ?) 
         OR (m.sender_id = ? AND m.receiver_id = ?)
         ORDER BY m.created_at ASC`,
        [userId, partnerId, partnerId, userId]
      )

      return NextResponse.json({ messages })
    } else {
      // Get all conversations for the user
      const [conversations] = await execute(
        `SELECT DISTINCT
         CASE 
           WHEN m.sender_id = ? THEN m.receiver_id
           ELSE m.sender_id
         END as partner_id,
         CASE 
           WHEN m.sender_id = ? THEN u2.full_name
           ELSE u1.full_name
         END as partner_name,
         m.content as last_message,
         m.created_at as last_message_time,
         m.is_read,
         CASE 
           WHEN m.sender_id = ? THEN 0
           ELSE 1
         END as is_sent_by_me
         FROM messages m
         JOIN users u1 ON m.sender_id = u1.id
         JOIN users u2 ON m.receiver_id = u2.id
         WHERE m.sender_id = ? OR m.receiver_id = ?
         AND m.id = (
           SELECT MAX(id) 
           FROM messages m2 
           WHERE (m2.sender_id = ? AND m2.receiver_id = partner_id)
           OR (m2.sender_id = partner_id AND m2.receiver_id = ?)
         )
         ORDER BY last_message_time DESC`,
        [userId, userId, userId, userId, userId, userId, userId]
      )

      return NextResponse.json({ conversations })
    }
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST /api/messages - Send a new message
export async function POST(request: NextRequest) {
  try {
    const { senderId, receiverId, content } = await request.json()

    if (!senderId || !receiverId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const [result] = await execute(
      'INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at) VALUES (?, ?, ?, 0, NOW())',
      [senderId, receiverId, content]
    )

    // Get the inserted message with user details
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

    return NextResponse.json({ 
      success: true, 
      message: messages[0] 
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

// PUT /api/messages - Mark messages as read
export async function PUT(request: NextRequest) {
  try {
    const { userId, partnerId } = await request.json()

    if (!userId || !partnerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await execute(
      'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0',
      [partnerId, userId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 })
  }
}

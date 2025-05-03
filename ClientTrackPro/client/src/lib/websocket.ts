import { create } from "zustand"
import type { ChatMessage } from "@shared/schema"

export type StreamEvent = {
  type: string
  eventType?: string
  platform?: string
  data?: any
  message?: ChatMessage
}

interface WebSocketStore {
  socket: WebSocket | null
  connected: boolean
  authenticated: boolean
  userId: number | null
  connect: () => void
  authenticate: (username: string, password: string) => Promise<boolean>
  disconnect: () => void
  sendChatMessage: (platform: string, message: string, username: string, displayName?: string, badges?: any) => void
  sendStreamEvent: (eventType: string, platform: string, data: any) => void
  updateStreamStatus: (status: "live" | "offline", platform: string, title?: string, stats?: any) => void
  subscribeToEvents: (callback: (event: StreamEvent) => void) => () => void
}

export const useWebSocketStore = create<WebSocketStore>((set, get) => {
  const callbacks: ((event: StreamEvent) => void)[] = []

  return {
    socket: null,
    connected: false,
    authenticated: false,
    userId: null,

    connect: () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
        const wsUrl = `${protocol}//${window.location.host}/ws`
        const socket = new WebSocket(wsUrl)

        socket.onopen = () => {
          set({ socket, connected: true })
          console.log("WebSocket connected")
        }

        socket.onclose = () => {
          set({ socket: null, connected: false, authenticated: false, userId: null })
          console.log("WebSocket disconnected")
        }

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)

            // Handle authentication response
            if (data.type === "auth") {
              if (data.success) {
                set({ authenticated: true, userId: data.userId })
                console.log("WebSocket authenticated", data.userId)
              }
            }

            // Notify all subscribers
            callbacks.forEach((callback) => callback(data))
          } catch (error) {
            console.error("Error parsing WebSocket message", error)
          }
        }

        socket.onerror = (error) => {
          console.error("WebSocket error", error)
        }

        set({ socket })
      } catch (error) {
        console.error("Error connecting to WebSocket", error)
      }
    },

    authenticate: (username, password) => {
      return new Promise((resolve) => {
        const { socket, connected } = get()

        if (!socket || !connected) {
          resolve(false)
          return
        }

        // Set up a one-time listener for the auth response
        const authListener = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === "auth") {
              socket.removeEventListener("message", authListener)
              if (data.success) {
                set({ authenticated: true, userId: data.userId })
                resolve(true)
              } else {
                resolve(false)
              }
            }
          } catch (error) {
            console.error("Error parsing auth response", error)
            resolve(false)
          }
        }

        socket.addEventListener("message", authListener)

        // Send auth request
        socket.send(
          JSON.stringify({
            type: "auth",
            username,
            password,
          }),
        )
      })
    },

    disconnect: () => {
      const { socket } = get()
      if (socket) {
        socket.close()
        set({ socket: null, connected: false, authenticated: false, userId: null })
      }
    },

    sendChatMessage: (platform, message, username, displayName, badges) => {
      const { socket, connected, authenticated } = get()

      if (!socket || !connected || !authenticated) {
        console.error("Cannot send message: socket not connected or not authenticated")
        return
      }

      socket.send(
        JSON.stringify({
          type: "chat_message",
          platform,
          username,
          displayName,
          message,
          badges,
        }),
      )
    },

    sendStreamEvent: (eventType, platform, data) => {
      const { socket, connected, authenticated } = get()

      if (!socket || !connected || !authenticated) {
        console.error("Cannot send event: socket not connected or not authenticated")
        return
      }

      socket.send(
        JSON.stringify({
          type: "stream_event",
          eventType,
          platform,
          data,
        }),
      )
    },

    updateStreamStatus: (status, platform, title, stats) => {
      const { socket, connected, authenticated } = get()

      if (!socket || !connected || !authenticated) {
        console.error("Cannot update stream status: socket not connected or not authenticated")
        return
      }

      socket.send(
        JSON.stringify({
          type: "stream_status",
          status,
          platform,
          title,
          stats,
        }),
      )
    },

    subscribeToEvents: (callback) => {
      callbacks.push(callback)

      // Return unsubscribe function
      return () => {
        const index = callbacks.indexOf(callback)
        if (index !== -1) {
          callbacks.splice(index, 1)
        }
      }
    },
  }
})

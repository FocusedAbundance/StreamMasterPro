import express, { type Express, type Request, type Response } from "express"
import { createServer, type Server } from "http"
import { storage } from "./storage"
import { WebSocketServer, WebSocket } from "ws"
import {
  insertUserSchema,
  insertPlatformConnectionSchema,
  insertStreamStatsSchema,
  insertGoalSchema,
  insertScheduledStreamSchema,
  insertAutomationSchema,
  insertChatMessageSchema,
  insertCompetitionSchema,
  insertCompetitionEntrySchema,
  insertGiveawaySchema,
} from "@shared/schema"
import { z } from "zod"

type WebSocketClient = {
  userId: number
  ws: WebSocket
}

// Placeholder for authentication middleware
const authMiddleware = (req: Request, res: Response, next: any) => {
  //Implementation to extract userId from session or token
  const userId = 1 // Replace with actual user ID extraction
  req.user = { id: userId }
  next()
}

// Placeholder for premium check middleware
const premiumCheck = (req: Request, res: Response, next: any) => {
  //Implementation to check subscription status
  const isPremium = false //Replace with actual subscription check
  if (!isPremium) return res.status(403).json({ message: "This feature is for premium users only." })
  next()
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app)

  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" })
  const clients: WebSocketClient[] = []

  wss.on("connection", (ws) => {
    let userId: number | null = null

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString())

        // Handle authentication
        if (data.type === "auth") {
          const user = await storage.getUserByUsername(data.username)
          if (user && data.password === user.password) {
            // In a real app, use proper password verification
            userId = user.id
            clients.push({ userId, ws })
            ws.send(JSON.stringify({ type: "auth", success: true, userId }))
          } else {
            ws.send(JSON.stringify({ type: "auth", success: false, error: "Invalid credentials" }))
          }
        }

        // Handle chat message
        else if (data.type === "chat_message" && userId) {
          const message = await storage.createChatMessage({
            userId,
            platform: data.platform,
            senderUsername: data.username,
            senderDisplayName: data.displayName || data.username,
            message: data.message,
            timestamp: new Date(),
            userBadges: data.badges || {},
          })

          // Broadcast to all clients
          broadcastToUser(userId, {
            type: "chat_message",
            message,
          })
        }

        // Handle stream event (follow, subscription, etc.)
        else if (data.type === "stream_event" && userId) {
          broadcastToUser(userId, {
            type: "stream_event",
            eventType: data.eventType,
            platform: data.platform,
            data: data.data,
          })

          // Handle specific events with appropriate storage operations
          if (data.eventType === "follow") {
            const platformConnection = (await storage.getPlatformConnections(userId)).find(
              (conn) => conn.platform === data.platform,
            )

            if (platformConnection) {
              await storage.createFollower({
                userId,
                platformConnectionId: platformConnection.id,
                followerUsername: data.data.username,
                followerDisplayName: data.data.displayName,
                followedAt: new Date(),
              })

              // Update connection follower count
              await storage.updatePlatformConnection(platformConnection.id, {
                followerCount: platformConnection.followerCount + 1,
              })
            }
          } else if (data.eventType === "subscription") {
            const platformConnection = (await storage.getPlatformConnections(userId)).find(
              (conn) => conn.platform === data.platform,
            )

            if (platformConnection) {
              await storage.createSubscriber({
                userId,
                platformConnectionId: platformConnection.id,
                subscriberUsername: data.data.username,
                subscriberDisplayName: data.data.displayName,
                tier: data.data.tier,
                subscribedAt: new Date(),
                renewsAt: data.data.renewsAt ? new Date(data.data.renewsAt) : undefined,
                isGift: data.data.isGift || false,
              })

              // Update connection subscriber count
              await storage.updatePlatformConnection(platformConnection.id, {
                subscriberCount: platformConnection.subscriberCount + 1,
              })
            }
          }
        }

        // Handle stream status update
        else if (data.type === "stream_status" && userId) {
          const activeStream = (await storage.getStreamStats(userId, 1))[0]

          if (data.status === "live" && !activeStream) {
            // Start new stream
            const newStream = await storage.createStreamStats({
              userId,
              title: data.title,
              platform: data.platform,
              startTime: new Date(),
            })

            broadcastToUser(userId, {
              type: "stream_started",
              stream: newStream,
            })
          } else if (data.status === "offline" && activeStream && !activeStream.endTime) {
            // End stream
            const updatedStream = await storage.updateStreamStats(activeStream.id, {
              endTime: new Date(),
            })

            broadcastToUser(userId, {
              type: "stream_ended",
              stream: updatedStream,
            })
          }
          // Update stream stats
          else if (activeStream && !activeStream.endTime) {
            const updatedStream = await storage.updateStreamStats(activeStream.id, {
              ...data.stats,
            })

            broadcastToUser(userId, {
              type: "stream_stats_updated",
              stream: updatedStream,
            })
          }
        }
      } catch (err) {
        console.error("WebSocket message error:", err)
      }
    })

    ws.on("close", () => {
      // Remove client on disconnect
      const index = clients.findIndex((client) => client.userId === userId && client.ws === ws)
      if (index !== -1) {
        clients.splice(index, 1)
      }
    })
  })

  // Function to broadcast messages to all clients of a specific user
  function broadcastToUser(userId: number, data: any) {
    const userClients = clients.filter((client) => client.userId === userId)
    const message = JSON.stringify(data)

    userClients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message)
      }
    })
  }

  // REST API routes
  const apiRouter = express.Router()
  app.use("/api", authMiddleware)

  // Free routes
  apiRouter.get("/platforms", async (req: Request, res: Response) => {
    const platforms = await storage.getPlatformConnections(req.user.id)
    // Free users can only use one platform
    if (!req.subscription || req.subscription.type === "free") {
      return res.json(platforms.slice(0, 1))
    }
    return res.json(platforms)
  })

  // Premium routes
  apiRouter.use("/multi-platform", premiumCheck)
  apiRouter.use("/analytics/advanced", premiumCheck)

  app.use("/api", apiRouter)

  // User routes
  apiRouter.post("/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body)
      const existingUser = await storage.getUserByUsername(userData.username)

      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" })
      }

      const user = await storage.createUser(userData)
      res.status(201).json(user)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: err.errors })
      }
      res.status(500).json({ message: "Error creating user" })
    }
  })

  apiRouter.get("/users/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(Number.parseInt(req.params.id))
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }
      res.json(user)
    } catch (err) {
      res.status(500).json({ message: "Error fetching user" })
    }
  })

  // Platform connection routes
  apiRouter.get("/users/:userId/platforms", async (req: Request, res: Response) => {
    try {
      const userId = Number.parseInt(req.params.userId)
      const connections = await storage.getPlatformConnections(userId)
      res.json(connections)
    } catch (err) {
      res.status(500).json({ message: "Error fetching platform connections" })
    }
  })

  apiRouter.post("/users/:userId/platforms", async (req: Request, res: Response) => {
    try {
      const userId = Number.parseInt(req.params.userId)
      const connectionData = insertPlatformConnectionSchema.parse({
        ...req.body,
        userId,
      })

      const connection = await storage.createPlatformConnection(connectionData)
      res.status(201).json(connection)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid connection data", errors: err.errors })
      }
      res.status(500).json({ message: "Error creating platform connection" })
    }
  })

  // Stream stats routes
  apiRouter.get("/users/:userId/streams", async (req: Request, res: Response) => {
    try {
      const userId = Number.parseInt(req.params.userId)
      const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined
      const stats = await storage.getStreamStats(userId, limit)
      res.json(stats)
    } catch (err) {
      res.status(500).json({ message: "Error fetching stream stats" })
    }
  })

  apiRouter.post("/users/:userId/streams", async (req: Request, res: Response) => {
    try {
      const userId = Number.parseInt(req.params.userId)
      const streamData = insertStreamStatsSchema.parse({
        ...req.body,
        userId,
      })

      const stream = await storage.createStreamStats(streamData)
      res.status(201).json(stream)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid stream data", errors: err.errors })
      }
      res.status(500).json({ message: "Error creating stream stats" })
    }
  })

  // Goal routes
  apiRouter.get("/users/:userId/goals", async (req: Request, res: Response) => {
    try {
      const userId = Number.parseInt(req.params.userId)
      const onlyActive = req.query.active === "true"
      const goals = await storage.getGoals(userId, onlyActive)
      res.json(goals)
    } catch (err) {
      res.status(500).json({ message: "Error fetching goals" })
    }
  })

  apiRouter.post("/users/:userId/goals", async (req: Request, res: Response) => {
    try {
      const userId = Number.parseInt(req.params.userId)
      const goalData = insertGoalSchema.parse({
        ...req.body,
        userId,
      })

      const goal = await storage.createGoal(goalData)
      res.status(201).json(goal)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: err.errors })
      }
      res.status(500).json({ message: "Error creating goal" })
    }
  })

  apiRouter.put("/goals/:id", async (req: Request, res: Response) => {
    try {
      const id = Number.parseInt(req.params.id)
      const goal = await storage.getGoalById(id)

      if (!goal) {
        return res.status(404).json({ message: "Goal not found" })
      }

      const updatedGoal = await storage.updateGoal(id, req.body)
      res.json(updatedGoal)
    } catch (err) {
      res.status(500).json({ message: "Error updating goal" })
    }
  })

  // Scheduled streams routes
  apiRouter.get("/users/:userId/scheduled-streams", async (req: Request, res: Response) => {
    try {
      const userId = Number.parseInt(req.params.userId)
      const streams = await storage.getScheduledStreams(userId)
      res.json(streams)
    } catch (err) {
      res.status(500).json({ message: "Error fetching scheduled streams" })
    }
  })

  apiRouter.post("/users/:userId/scheduled-streams", async (req: Request, res: Response) => {
    try {
      const userId = Number.parseInt(req.params.userId)
      const streamData = insertScheduledStreamSchema.parse({
        ...req.body,
        userId,
      })

      const stream = await storage.createScheduledStream(streamData)
      res.status(201).json(stream)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid scheduled stream data", errors: err.errors })
      }
      res.status(500).json({ message: "Error creating scheduled stream" })
    }
  })

  // Automation routes
  apiRouter.get("/users/:userId/automations", async (req: Request, res: Response) => {
    try {
      const userId = Number.parseInt(req.params.userId)
      const onlyActive = req.query.active === "true"
      const automations = await storage.getAutomations(userId, onlyActive)
      res.json(automations)
    } catch (err) {
      res.status(500).json({ message: "Error fetching automations" })
    }
  })

  apiRouter.post("/users/:userId/automations", async (req: Request, res: Response) => {
    try {
      const userId = Number.parseInt(req.params.userId)
      const automationData = insertAutomationSchema.parse({
        ...req.body,
        userId,
      })

      const automation = await storage.createAutomation(automationData)
      res.status(201).json(automation)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid automation data", errors: err.errors })
      }
      res.status(500).json({ message: "Error creating automation" })
    }
  })

  apiRouter.put("/automations/:id", async (req: Request, res: Response) => {
    try {
      const id = Number.parseInt(req.params.id)
      const automation = await storage.getAutomationById(id)

      if (!automation) {
        return res.status(404).json({ message: "Automation not found" })
      }

      const updatedAutomation = await storage.updateAutomation(id, req.body)
      res.json(updatedAutomation)
    } catch (err) {
      res.status(500).json({ message: "Error updating automation" })
    }
  })

  // Chat message routes
  apiRouter.get("/users/:userId/chat-messages", async (req: Request, res: Response) => {
    try {
      const userId = Number.parseInt(req.params.userId)
      const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined
      const platform = req.query.platform as string | undefined

      const messages = await storage.getChatMessages(userId, limit, platform)
      res.json(messages)
    } catch (err) {
      res.status(500).json({ message: "Error fetching chat messages" })
    }
  })

  apiRouter.post("/users/:userId/chat-messages", async (req: Request, res: Response) => {
    try {
      const userId = Number.parseInt(req.params.userId)
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        userId,
      })

      const message = await storage.createChatMessage(messageData)
      res.status(201).json(message)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid chat message data", errors: err.errors })
      }
      res.status(500).json({ message: "Error creating chat message" })
    }
  })

  // Follower routes
  apiRouter.get("/users/:userId/followers", async (req: Request, res: Response) => {
    try {
      const userId = Number.parseInt(req.params.userId)
      const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined
      const platform = req.query.platform as string | undefined

      const followers = await storage.getFollowers(userId, limit, platform)
      res.json(followers)
    } catch (err) {
      res.status(500).json({ message: "Error fetching followers" })
    }
  })

  // Subscriber routes
  apiRouter.get("/users/:userId/subscribers", async (req: Request, res: Response) => {
    try {
      const userId = Number.parseInt(req.params.userId)
      const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined
      const platform = req.query.platform as string | undefined

      const subscribers = await storage.getSubscribers(userId, limit, platform)
      res.json(subscribers)
    } catch (err) {
      res.status(500).json({ message: "Error fetching subscribers" })
    }
  })

  // Login route
  apiRouter.post("/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" })
      }

      const user = await storage.getUserByUsername(username)

      if (!user || user.password !== password) {
        // In a real app, use bcrypt to compare passwords
        return res.status(401).json({ message: "Invalid credentials" })
      }

      // In a real app, create a JWT token here
      res.json({
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
      })
    } catch (err) {
      res.status(500).json({ message: "Error during login" })
    }
  })

  // Competition routes
  apiRouter.get("/users/:userId/competitions", async (req: Request, res: Response) => {
    try {
      const userId = Number.parseInt(req.params.userId)
      const onlyActive = req.query.active === "true"

      const competitions = await storage.getCompetitions(userId, onlyActive)
      res.json(competitions)
    } catch (err) {
      res.status(500).json({ message: "Error fetching competitions" })
    }
  })

  apiRouter.post("/users/:userId/competitions", async (req: Request, res: Response) => {
    try {
      const userId = Number.parseInt(req.params.userId)
      const competitionData = insertCompetitionSchema.parse({
        ...req.body,
        userId,
      })

      const competition = await storage.createCompetition(competitionData)
      res.status(201).json(competition)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid competition data", errors: err.errors })
      }
      res.status(500).json({ message: "Error creating competition" })
    }
  })

  apiRouter.get("/competitions/:id", async (req: Request, res: Response) => {
    try {
      const id = Number.parseInt(req.params.id)
      const competition = await storage.getCompetitionById(id)

      if (!competition) {
        return res.status(404).json({ message: "Competition not found" })
      }

      res.json(competition)
    } catch (err) {
      res.status(500).json({ message: "Error fetching competition" })
    }
  })

  apiRouter.put("/competitions/:id", async (req: Request, res: Response) => {
    try {
      const id = Number.parseInt(req.params.id)
      const competition = await storage.getCompetitionById(id)

      if (!competition) {
        return res.status(404).json({ message: "Competition not found" })
      }

      const updatedCompetition = await storage.updateCompetition(id, req.body)
      res.json(updatedCompetition)
    } catch (err) {
      res.status(500).json({ message: "Error updating competition" })
    }
  })

  apiRouter.delete("/competitions/:id", async (req: Request, res: Response) => {
    try {
      const id = Number.parseInt(req.params.id)
      const competition = await storage.getCompetitionById(id)

      if (!competition) {
        return res.status(404).json({ message: "Competition not found" })
      }

      const success = await storage.deleteCompetition(id)
      if (success) {
        res.status(204).end()
      } else {
        res.status(500).json({ message: "Error deleting competition" })
      }
    } catch (err) {
      res.status(500).json({ message: "Error deleting competition" })
    }
  })

  // Competition entries routes
  apiRouter.get("/competitions/:id/entries", async (req: Request, res: Response) => {
    try {
      const competitionId = Number.parseInt(req.params.id)
      const entries = await storage.getCompetitionEntries(competitionId)
      res.json(entries)
    } catch (err) {
      res.status(500).json({ message: "Error fetching competition entries" })
    }
  })

  apiRouter.post("/competitions/:id/entries", async (req: Request, res: Response) => {
    try {
      const competitionId = Number.parseInt(req.params.id)
      const entryData = insertCompetitionEntrySchema.parse({
        ...req.body,
        competitionId,
      })

      const entry = await storage.createCompetitionEntry(entryData)
      res.status(201).json(entry)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid entry data", errors: err.errors })
      }
      res.status(500).json({ message: "Error creating competition entry" })
    }
  })

  apiRouter.put("/competition-entries/:id", async (req: Request, res: Response) => {
    try {
      const id = Number.parseInt(req.params.id)
      const entry = await storage.getCompetitionEntryById(id)

      if (!entry) {
        return res.status(404).json({ message: "Competition entry not found" })
      }

      const updatedEntry = await storage.updateCompetitionEntry(id, req.body)
      res.json(updatedEntry)
    } catch (err) {
      res.status(500).json({ message: "Error updating competition entry" })
    }
  })

  apiRouter.delete("/competition-entries/:id", async (req: Request, res: Response) => {
    try {
      const id = Number.parseInt(req.params.id)
      const entry = await storage.getCompetitionEntryById(id)

      if (!entry) {
        return res.status(404).json({ message: "Competition entry not found" })
      }

      const success = await storage.deleteCompetitionEntry(id)
      if (success) {
        res.status(204).end()
      } else {
        res.status(500).json({ message: "Error deleting competition entry" })
      }
    } catch (err) {
      res.status(500).json({ message: "Error deleting competition entry" })
    }
  })

  // Giveaway routes
  apiRouter.get("/users/:userId/giveaways", async (req: Request, res: Response) => {
    try {
      const userId = Number.parseInt(req.params.userId)
      const onlyActive = req.query.active === "true"

      const giveaways = await storage.getGiveaways(userId, onlyActive)
      res.json(giveaways)
    } catch (err) {
      res.status(500).json({ message: "Error fetching giveaways" })
    }
  })

  apiRouter.post("/users/:userId/giveaways", async (req: Request, res: Response) => {
    try {
      const userId = Number.parseInt(req.params.userId)
      const giveawayData = insertGiveawaySchema.parse({
        ...req.body,
        userId,
      })

      const giveaway = await storage.createGiveaway(giveawayData)
      res.status(201).json(giveaway)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid giveaway data", errors: err.errors })
      }
      res.status(500).json({ message: "Error creating giveaway" })
    }
  })

  apiRouter.get("/giveaways/:id", async (req: Request, res: Response) => {
    try {
      const id = Number.parseInt(req.params.id)
      const giveaway = await storage.getGiveawayById(id)

      if (!giveaway) {
        return res.status(404).json({ message: "Giveaway not found" })
      }

      res.json(giveaway)
    } catch (err) {
      res.status(500).json({ message: "Error fetching giveaway" })
    }
  })

  apiRouter.put("/giveaways/:id", async (req: Request, res: Response) => {
    try {
      const id = Number.parseInt(req.params.id)
      const giveaway = await storage.getGiveawayById(id)

      if (!giveaway) {
        return res.status(404).json({ message: "Giveaway not found" })
      }

      const updatedGiveaway = await storage.updateGiveaway(id, req.body)
      res.json(updatedGiveaway)
    } catch (err) {
      res.status(500).json({ message: "Error updating giveaway" })
    }
  })

  apiRouter.delete("/giveaways/:id", async (req: Request, res: Response) => {
    try {
      const id = Number.parseInt(req.params.id)
      const giveaway = await storage.getGiveawayById(id)

      if (!giveaway) {
        return res.status(404).json({ message: "Giveaway not found" })
      }

      const success = await storage.deleteGiveaway(id)
      if (success) {
        res.status(204).end()
      } else {
        res.status(500).json({ message: "Error deleting giveaway" })
      }
    } catch (err) {
      res.status(500).json({ message: "Error deleting giveaway" })
    }
  })

  // Return the HTTP server
  return httpServer
}

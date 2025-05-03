import { eq, and, desc, asc } from "drizzle-orm"
import { db } from "./db"
import * as schema from "../shared/schema"
import type {
  User,
  InsertUser,
  PlatformConnection,
  InsertPlatformConnection,
  StreamStats,
  InsertStreamStats,
  Goal,
  InsertGoal,
  ScheduledStream,
  InsertScheduledStream,
  Automation,
  InsertAutomation,
  ChatMessage,
  InsertChatMessage,
  Follower,
  InsertFollower,
  Subscriber,
  InsertSubscriber,
  Competition,
  InsertCompetition,
  CompetitionEntry,
  InsertCompetitionEntry,
  Giveaway,
  InsertGiveaway,
} from "@shared/schema"

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>
  getUserByUsername(username: string): Promise<User | undefined>
  createUser(user: InsertUser): Promise<User>

  // Platform connections
  getPlatformConnections(userId: number): Promise<PlatformConnection[]>
  createPlatformConnection(connection: InsertPlatformConnection): Promise<PlatformConnection>
  updatePlatformConnection(id: number, data: Partial<InsertPlatformConnection>): Promise<PlatformConnection | undefined>
  deletePlatformConnection(id: number): Promise<boolean>

  // Stream stats
  getStreamStats(userId: number, limit?: number): Promise<StreamStats[]>
  getStreamStatsById(id: number): Promise<StreamStats | undefined>
  createStreamStats(stats: InsertStreamStats): Promise<StreamStats>
  updateStreamStats(id: number, data: Partial<StreamStats>): Promise<StreamStats | undefined>

  // Goals
  getGoals(userId: number, onlyActive?: boolean): Promise<Goal[]>
  getGoalById(id: number): Promise<Goal | undefined>
  createGoal(goal: InsertGoal): Promise<Goal>
  updateGoal(id: number, data: Partial<Goal>): Promise<Goal | undefined>
  deleteGoal(id: number): Promise<boolean>

  // Scheduled streams
  getScheduledStreams(userId: number): Promise<ScheduledStream[]>
  getScheduledStreamById(id: number): Promise<ScheduledStream | undefined>
  createScheduledStream(stream: InsertScheduledStream): Promise<ScheduledStream>
  updateScheduledStream(id: number, data: Partial<ScheduledStream>): Promise<ScheduledStream | undefined>
  deleteScheduledStream(id: number): Promise<boolean>

  // Automations
  getAutomations(userId: number, onlyActive?: boolean): Promise<Automation[]>
  getAutomationById(id: number): Promise<Automation | undefined>
  createAutomation(automation: InsertAutomation): Promise<Automation>
  updateAutomation(id: number, data: Partial<Automation>): Promise<Automation | undefined>
  deleteAutomation(id: number): Promise<boolean>

  // Chat messages
  getChatMessages(userId: number, limit?: number, platform?: string): Promise<ChatMessage[]>
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>

  // Followers and subscribers
  getFollowers(userId: number, limit?: number, platform?: string): Promise<Follower[]>
  createFollower(follower: InsertFollower): Promise<Follower>

  getSubscribers(userId: number, limit?: number, platform?: string): Promise<Subscriber[]>
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>

  // Competitions
  getCompetitions(userId: number, onlyActive?: boolean): Promise<Competition[]>
  getCompetitionById(id: number): Promise<Competition | undefined>
  createCompetition(competition: InsertCompetition): Promise<Competition>
  updateCompetition(id: number, data: Partial<Competition>): Promise<Competition | undefined>
  deleteCompetition(id: number): Promise<boolean>

  // Competition entries
  getCompetitionEntries(competitionId: number): Promise<CompetitionEntry[]>
  getCompetitionEntryById(id: number): Promise<CompetitionEntry | undefined>
  getCompetitionEntryByParticipant(
    competitionId: number,
    participantName: string,
    participantPlatform: string,
  ): Promise<CompetitionEntry | undefined>
  createCompetitionEntry(entry: InsertCompetitionEntry): Promise<CompetitionEntry>
  updateCompetitionEntry(id: number, data: Partial<CompetitionEntry>): Promise<CompetitionEntry | undefined>
  deleteCompetitionEntry(id: number): Promise<boolean>

  // Giveaways
  getGiveaways(userId: number, onlyActive?: boolean): Promise<Giveaway[]>
  getGiveawayById(id: number): Promise<Giveaway | undefined>
  createGiveaway(giveaway: InsertGiveaway): Promise<Giveaway>
  updateGiveaway(id: number, data: Partial<Giveaway>): Promise<Giveaway | undefined>
  deleteGiveaway(id: number): Promise<boolean>

  // Initialize demo data
  initializeDemoData(): Promise<void>
}

// PostgreSQL storage implementation
export class PostgresStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1)
    return users[0]
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1)
    return users[0]
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning()
    return result[0]
  }

  // Platform connections
  async getPlatformConnections(userId: number): Promise<PlatformConnection[]> {
    return db.select().from(schema.platformConnections).where(eq(schema.platformConnections.userId, userId))
  }

  async createPlatformConnection(connection: InsertPlatformConnection): Promise<PlatformConnection> {
    const result = await db.insert(schema.platformConnections).values(connection).returning()
    return result[0]
  }

  async updatePlatformConnection(
    id: number,
    data: Partial<InsertPlatformConnection>,
  ): Promise<PlatformConnection | undefined> {
    const result = await db
      .update(schema.platformConnections)
      .set(data)
      .where(eq(schema.platformConnections.id, id))
      .returning()
    return result[0]
  }

  async deletePlatformConnection(id: number): Promise<boolean> {
    const result = await db.delete(schema.platformConnections).where(eq(schema.platformConnections.id, id))
    return result.count > 0
  }

  // Stream stats
  async getStreamStats(userId: number, limit?: number): Promise<StreamStats[]> {
    let query = db
      .select()
      .from(schema.streamStats)
      .where(eq(schema.streamStats.userId, userId))
      .orderBy(desc(schema.streamStats.startTime))

    if (limit) {
      query = query.limit(limit)
    }

    return query
  }

  async getStreamStatsById(id: number): Promise<StreamStats | undefined> {
    const stats = await db.select().from(schema.streamStats).where(eq(schema.streamStats.id, id)).limit(1)
    return stats[0]
  }

  async createStreamStats(stats: InsertStreamStats): Promise<StreamStats> {
    const result = await db.insert(schema.streamStats).values(stats).returning()
    return result[0]
  }

  async updateStreamStats(id: number, data: Partial<StreamStats>): Promise<StreamStats | undefined> {
    const result = await db.update(schema.streamStats).set(data).where(eq(schema.streamStats.id, id)).returning()
    return result[0]
  }

  // Goals
  async getGoals(userId: number, onlyActive?: boolean): Promise<Goal[]> {
    let query = db.select().from(schema.goals).where(eq(schema.goals.userId, userId))

    if (onlyActive) {
      query = query.where(eq(schema.goals.isActive, true))
    }

    return query
  }

  async getGoalById(id: number): Promise<Goal | undefined> {
    const goals = await db.select().from(schema.goals).where(eq(schema.goals.id, id)).limit(1)
    return goals[0]
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const result = await db.insert(schema.goals).values(goal).returning()
    return result[0]
  }

  async updateGoal(id: number, data: Partial<Goal>): Promise<Goal | undefined> {
    const result = await db.update(schema.goals).set(data).where(eq(schema.goals.id, id)).returning()
    return result[0]
  }

  async deleteGoal(id: number): Promise<boolean> {
    const result = await db.delete(schema.goals).where(eq(schema.goals.id, id))
    return result.count > 0
  }

  // Scheduled streams
  async getScheduledStreams(userId: number): Promise<ScheduledStream[]> {
    return db
      .select()
      .from(schema.scheduledStreams)
      .where(eq(schema.scheduledStreams.userId, userId))
      .orderBy(asc(schema.scheduledStreams.startTime))
  }

  async getScheduledStreamById(id: number): Promise<ScheduledStream | undefined> {
    const streams = await db.select().from(schema.scheduledStreams).where(eq(schema.scheduledStreams.id, id)).limit(1)
    return streams[0]
  }

  async createScheduledStream(stream: InsertScheduledStream): Promise<ScheduledStream> {
    const result = await db.insert(schema.scheduledStreams).values(stream).returning()
    return result[0]
  }

  async updateScheduledStream(id: number, data: Partial<ScheduledStream>): Promise<ScheduledStream | undefined> {
    const result = await db
      .update(schema.scheduledStreams)
      .set(data)
      .where(eq(schema.scheduledStreams.id, id))
      .returning()
    return result[0]
  }

  async deleteScheduledStream(id: number): Promise<boolean> {
    const result = await db.delete(schema.scheduledStreams).where(eq(schema.scheduledStreams.id, id))
    return result.count > 0
  }

  // Automations
  async getAutomations(userId: number, onlyActive?: boolean): Promise<Automation[]> {
    let query = db.select().from(schema.automations).where(eq(schema.automations.userId, userId))

    if (onlyActive) {
      query = query.where(eq(schema.automations.isActive, true))
    }

    return query
  }

  async getAutomationById(id: number): Promise<Automation | undefined> {
    const automations = await db.select().from(schema.automations).where(eq(schema.automations.id, id)).limit(1)
    return automations[0]
  }

  async createAutomation(automation: InsertAutomation): Promise<Automation> {
    const result = await db.insert(schema.automations).values(automation).returning()
    return result[0]
  }

  async updateAutomation(id: number, data: Partial<Automation>): Promise<Automation | undefined> {
    const result = await db.update(schema.automations).set(data).where(eq(schema.automations.id, id)).returning()
    return result[0]
  }

  async deleteAutomation(id: number): Promise<boolean> {
    const result = await db.delete(schema.automations).where(eq(schema.automations.id, id))
    return result.count > 0
  }

  // Chat messages
  async getChatMessages(userId: number, limit?: number, platform?: string): Promise<ChatMessage[]> {
    let query = db
      .select()
      .from(schema.chatMessages)
      .where(eq(schema.chatMessages.userId, userId))
      .orderBy(desc(schema.chatMessages.timestamp))

    if (platform) {
      query = query.where(eq(schema.chatMessages.platform, platform))
    }

    if (limit) {
      query = query.limit(limit)
    }

    return query
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const result = await db.insert(schema.chatMessages).values(message).returning()
    return result[0]
  }

  // Followers
  async getFollowers(userId: number, limit?: number, platform?: string): Promise<Follower[]> {
    let query = db
      .select()
      .from(schema.followers)
      .innerJoin(schema.platformConnections, eq(schema.followers.platformConnectionId, schema.platformConnections.id))
      .where(eq(schema.followers.userId, userId))
      .orderBy(desc(schema.followers.followedAt))

    if (platform) {
      query = query.where(eq(schema.platformConnections.platform, platform))
    }

    if (limit) {
      query = query.limit(limit)
    }

    const results = await query
    return results.map((r) => r.followers)
  }

  async createFollower(follower: InsertFollower): Promise<Follower> {
    const result = await db.insert(schema.followers).values(follower).returning()
    return result[0]
  }

  // Subscribers
  async getSubscribers(userId: number, limit?: number, platform?: string): Promise<Subscriber[]> {
    let query = db
      .select()
      .from(schema.subscribers)
      .innerJoin(schema.platformConnections, eq(schema.subscribers.platformConnectionId, schema.platformConnections.id))
      .where(eq(schema.subscribers.userId, userId))
      .orderBy(desc(schema.subscribers.subscribedAt))

    if (platform) {
      query = query.where(eq(schema.platformConnections.platform, platform))
    }

    if (limit) {
      query = query.limit(limit)
    }

    const results = await query
    return results.map((r) => r.subscribers)
  }

  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const result = await db.insert(schema.subscribers).values(subscriber).returning()
    return result[0]
  }

  // Competitions
  async getCompetitions(userId: number, onlyActive?: boolean): Promise<Competition[]> {
    let query = db
      .select()
      .from(schema.competitions)
      .where(eq(schema.competitions.userId, userId))
      .orderBy(desc(schema.competitions.createdAt))

    if (onlyActive) {
      query = query.where(eq(schema.competitions.isActive, true))
    }

    return query
  }

  async getCompetitionById(id: number): Promise<Competition | undefined> {
    const competitions = await db.select().from(schema.competitions).where(eq(schema.competitions.id, id)).limit(1)
    return competitions[0]
  }

  async createCompetition(competition: InsertCompetition): Promise<Competition> {
    const result = await db.insert(schema.competitions).values(competition).returning()
    return result[0]
  }

  async updateCompetition(id: number, data: Partial<Competition>): Promise<Competition | undefined> {
    const result = await db.update(schema.competitions).set(data).where(eq(schema.competitions.id, id)).returning()
    return result[0]
  }

  async deleteCompetition(id: number): Promise<boolean> {
    // First delete all related entries
    await db.delete(schema.competitionEntries).where(eq(schema.competitionEntries.competitionId, id))

    // Then delete the competition
    const result = await db.delete(schema.competitions).where(eq(schema.competitions.id, id))
    return result.count > 0
  }

  // Competition entries
  async getCompetitionEntries(competitionId: number): Promise<CompetitionEntry[]> {
    return db
      .select()
      .from(schema.competitionEntries)
      .where(eq(schema.competitionEntries.competitionId, competitionId))
      .orderBy(desc(schema.competitionEntries.totalPoints))
  }

  async getCompetitionEntryById(id: number): Promise<CompetitionEntry | undefined> {
    const entries = await db
      .select()
      .from(schema.competitionEntries)
      .where(eq(schema.competitionEntries.id, id))
      .limit(1)
    return entries[0]
  }

  async getCompetitionEntryByParticipant(
    competitionId: number,
    participantName: string,
    participantPlatform: string,
  ): Promise<CompetitionEntry | undefined> {
    const entries = await db
      .select()
      .from(schema.competitionEntries)
      .where(
        and(
          eq(schema.competitionEntries.competitionId, competitionId),
          eq(schema.competitionEntries.participantName, participantName),
          eq(schema.competitionEntries.participantPlatform, participantPlatform),
        ),
      )
      .limit(1)
    return entries[0]
  }

  async createCompetitionEntry(entry: InsertCompetitionEntry): Promise<CompetitionEntry> {
    const result = await db.insert(schema.competitionEntries).values(entry).returning()
    return result[0]
  }

  async updateCompetitionEntry(id: number, data: Partial<CompetitionEntry>): Promise<CompetitionEntry | undefined> {
    const result = await db
      .update(schema.competitionEntries)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schema.competitionEntries.id, id))
      .returning()
    return result[0]
  }

  async deleteCompetitionEntry(id: number): Promise<boolean> {
    const result = await db.delete(schema.competitionEntries).where(eq(schema.competitionEntries.id, id))
    return result.count > 0
  }

  // Giveaways
  async getGiveaways(userId: number, onlyActive?: boolean): Promise<Giveaway[]> {
    let query = db
      .select()
      .from(schema.giveaways)
      .where(eq(schema.giveaways.userId, userId))
      .orderBy(desc(schema.giveaways.createdAt))

    if (onlyActive) {
      query = query.where(eq(schema.giveaways.isActive, true))
    }

    return query
  }

  async getGiveawayById(id: number): Promise<Giveaway | undefined> {
    const giveaways = await db.select().from(schema.giveaways).where(eq(schema.giveaways.id, id)).limit(1)
    return giveaways[0]
  }

  async createGiveaway(giveaway: InsertGiveaway): Promise<Giveaway> {
    const result = await db.insert(schema.giveaways).values(giveaway).returning()
    return result[0]
  }

  async updateGiveaway(id: number, data: Partial<Giveaway>): Promise<Giveaway | undefined> {
    const result = await db.update(schema.giveaways).set(data).where(eq(schema.giveaways.id, id)).returning()
    return result[0]
  }

  async deleteGiveaway(id: number): Promise<boolean> {
    const result = await db.delete(schema.giveaways).where(eq(schema.giveaways.id, id))
    return result.count > 0
  }

  // Initialize with demo data
  async initializeDemoData(): Promise<void> {
    try {
      // Check if demo user already exists
      const existingUser = await this.getUserByUsername("GamerPro123")
      if (existingUser) {
        console.log("Demo data already initialized")
        return
      }

      // Create demo user
      const demoUser: InsertUser = {
        username: "GamerPro123",
        password: "password123", // In a real app, this would be hashed
        displayName: "GamerPro123",
        email: "gamer@example.com",
        avatarUrl: "https://i.pravatar.cc/150?img=1",
      }

      const user = await this.createUser(demoUser)
      const userId = user.id

      // Create platform connections
      const twitchConn = await this.createPlatformConnection({
        userId,
        platform: "twitch",
        platformUserId: "twitch123",
        platformUsername: "GamerPro123",
        accessToken: "mock-token",
        refreshToken: "mock-refresh",
        isPrimary: true,
      })
      await this.updatePlatformConnection(twitchConn.id, { followerCount: 24531, subscriberCount: 437 })

      const youtubeConn = await this.createPlatformConnection({
        userId,
        platform: "youtube",
        platformUserId: "youtube123",
        platformUsername: "GamerPro123",
        accessToken: "mock-token",
        refreshToken: "mock-refresh",
        isPrimary: false,
      })
      await this.updatePlatformConnection(youtubeConn.id, { followerCount: 12785, subscriberCount: 215 })

      const fbConn = await this.createPlatformConnection({
        userId,
        platform: "facebook",
        platformUserId: "facebook123",
        platformUsername: "GamerPro123",
        accessToken: "mock-token",
        refreshToken: "mock-refresh",
        isPrimary: false,
      })
      await this.updatePlatformConnection(fbConn.id, { followerCount: 8429, subscriberCount: 126 })

      // Create current stream
      const now = new Date()
      const stream = await this.createStreamStats({
        userId,
        title: "Fortnite - Season 8",
        platform: "twitch",
        startTime: new Date(now.getTime() - 9000000), // Started 2.5 hours ago
      })

      // Update with current stats
      await this.updateStreamStats(stream.id, {
        peakViewers: 1500,
        averageViewers: 1243,
        newFollowers: 147,
        newSubscribers: 24,
        chatMessages: 3256,
      })

      // Create goal
      await this.createGoal({
        userId,
        title: "Monthly Subscribers",
        targetValue: 500,
        currentValue: 450,
        goalType: "subscribers",
        deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        isActive: true,
      })

      // Create scheduled streams
      const createScheduledStreams = [
        {
          userId,
          title: "Minecraft Build Challenge",
          description: "Building epic structures with viewers",
          startTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000), // 3 days from now, 7PM
          endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 22 * 60 * 60 * 1000), // 3 days from now, 10PM
          platforms: ["twitch", "youtube"],
        },
        {
          userId,
          title: "Fortnite with Subscribers",
          description: "Playing with subscribers and viewers",
          startTime: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000), // 6 days from now, 8PM
          endTime: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000), // 6 days from now, 11PM
          platforms: ["twitch", "youtube", "facebook"],
        },
        {
          userId,
          title: "Special Q&A Session",
          description: "Answering viewer questions",
          startTime: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000), // 9 days from now, 6PM
          endTime: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000), // 9 days from now, 8PM
          platforms: ["twitch"],
        },
      ]

      for (const stream of createScheduledStreams) {
        await this.createScheduledStream(stream)
      }

      // Create automations
      const automations = [
        {
          userId,
          name: "Follower Milestone Alerts",
          description: "Triggers every 10 new followers",
          triggerType: "follower",
          triggerValue: "10",
          actionType: "overlay",
          actionData: { message: "New follower milestone reached!" },
          isActive: true,
        },
        {
          userId,
          name: "Hourly Giveaway Reminder",
          description: "Posts in chat every 60 minutes",
          triggerType: "timer",
          triggerValue: "3600",
          actionType: "chat_message",
          actionData: { message: "Don't forget to enter the giveaway by typing !enter in chat!" },
          isActive: true,
        },
        {
          userId,
          name: "New Sub Animation",
          description: "Plays animation on new subscribers",
          triggerType: "subscriber",
          triggerValue: "1",
          actionType: "overlay",
          actionData: { animationType: "celebration" },
          isActive: true,
        },
      ]

      for (const automation of automations) {
        await this.createAutomation(automation)
      }

      // Create some demo chat messages
      const chatMessages = [
        {
          userId,
          platform: "twitch",
          senderUsername: "TwitchUser123",
          senderDisplayName: "TwitchUser123",
          message: "Hey there! Love the stream today, that was an amazing play!",
          timestamp: new Date(now.getTime() - 4 * 60 * 1000), // 4 minutes ago
          userBadges: { subscriber: "3", premium: "1" },
        },
        {
          userId,
          platform: "youtube",
          senderUsername: "YTGamer",
          senderDisplayName: "YTGamer",
          message: "Can you show your loadout again? I missed it earlier",
          timestamp: new Date(now.getTime() - 2 * 60 * 1000), // 2 minutes ago
          userBadges: { member: "2" },
        },
        {
          userId,
          platform: "facebook",
          senderUsername: "JohnDoe",
          senderDisplayName: "JohnDoe",
          message: "First time catching your stream live! Excited to be here!",
          timestamp: new Date(now.getTime() - 1 * 60 * 1000), // 1 minute ago
          userBadges: {},
        },
        {
          userId,
          platform: "twitch",
          senderUsername: "StreamFan99",
          senderDisplayName: "StreamFan99",
          message: "!uptime",
          timestamp: new Date(now.getTime() - 10 * 1000), // 10 seconds ago
          userBadges: {},
        },
      ]

      for (const message of chatMessages) {
        await this.createChatMessage(message)
      }

      // Create some demo competitions
      const currentDate = new Date()
      const nextWeek = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      const nextMonth = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000)

      // Create a standard giveaway
      await this.createGiveaway({
        userId,
        title: "Weekly Subscriber Giveaway",
        description: "Win a $50 Steam gift card by being a subscriber and active in chat",
        startDate: currentDate,
        endDate: nextWeek,
        isActive: true,
        entryMethod: "subscribers_only",
        eligiblePlatforms: ["twitch", "youtube"],
        prize: "$50 Steam Gift Card",
      })

      // Create a standard competition
      await this.createCompetition({
        userId,
        title: "Monthly Community Challenge",
        description: "Participate in our monthly community challenge for prizes!",
        startDate: currentDate,
        endDate: nextMonth,
        isActive: true,
        competitionType: "standard",
        entryMethods: [{ type: "chat_command", command: "!enter", points: 1 }],
        prizes: [
          { position: 1, description: "Gaming Headset", value: 100 },
          { position: 2, description: "$50 Amazon Gift Card", value: 50 },
          { position: 3, description: "$25 Amazon Gift Card", value: 25 },
        ],
      })

      // Create an extended competition with secret words and watch time
      const secretWords = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentDate.getTime() + i * 24 * 60 * 60 * 1000)
        secretWords.push({
          date: date.toISOString().split("T")[0],
          word: `secret${i + 1}`,
        })
      }

      const extendedCompetition = await this.createCompetition({
        userId,
        title: "Ultimate Fan Competition",
        description:
          "A month-long competition to find our biggest fan! Track social media engagement, secret words, and watch time.",
        startDate: currentDate,
        endDate: nextMonth,
        isActive: true,
        competitionType: "extended",
        entryMethods: [
          { type: "watch_time", points: 1, description: "1 point per minute watched" },
          { type: "secret_word", points: 50, description: "50 points per secret word" },
          { type: "social_media", points: 100, description: "100 points per social media interaction" },
        ],
        prizes: [
          { position: 1, description: "Gaming PC Upgrade Package", value: 500 },
          { position: 2, description: "Premium Gaming Headset", value: 200 },
          { position: 3, description: "1 Year Subscription", value: 100 },
        ],
        dailySecretWords: secretWords,
        socialIntegrations: [
          { platform: "twitter", tag: "#MyStreamCompetition" },
          { platform: "instagram", tag: "#MyStreamCompetition" },
          { platform: "tiktok", tag: "#MyStreamChallenge" },
        ],
        watchTimeMultiplier: 1,
      })

      // Create some sample entries
      const sampleEntries = [
        {
          competitionId: extendedCompetition.id,
          participantName: "SuperFan123",
          participantPlatform: "twitch",
          participantId: "12345",
          totalPoints: 230,
          entries: [
            { type: "watch_time", points: 180, timestamp: currentDate },
            { type: "secret_word", word: "secret1", points: 50, timestamp: currentDate },
          ],
          watchTimeMinutes: 180,
          secretWordsUsed: [{ word: "secret1", date: currentDate.toISOString().split("T")[0], points: 50 }],
        },
        {
          competitionId: extendedCompetition.id,
          participantName: "GameLover99",
          participantPlatform: "youtube",
          participantId: "67890",
          totalPoints: 310,
          entries: [
            { type: "watch_time", points: 160, timestamp: currentDate },
            { type: "secret_word", word: "secret1", points: 50, timestamp: currentDate },
            { type: "social_media", platform: "twitter", points: 100, timestamp: currentDate },
          ],
          watchTimeMinutes: 160,
          secretWordsUsed: [{ word: "secret1", date: currentDate.toISOString().split("T")[0], points: 50 }],
          socialInteractions: [{ platform: "twitter", postId: "tw12345", points: 100, timestamp: currentDate }],
        },
      ]

      for (const entry of sampleEntries) {
        await this.createCompetitionEntry(entry)
      }

      console.log("Demo data initialized successfully")
    } catch (error) {
      console.error("Error initializing demo data:", error)
      throw error
    }
  }
}

// Export the storage instance
export const storage = new PostgresStorage()

// Initialize demo data if needed
storage.initializeDemoData().catch(console.error)

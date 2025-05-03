import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"
import type { z } from "zod"

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
})

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
  avatarUrl: true,
})

// Platform connection schema
export const platformConnections = pgTable("platform_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  platform: text("platform").notNull(), // twitch, youtube, facebook
  platformUserId: text("platform_user_id").notNull(),
  platformUsername: text("platform_username").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  isPrimary: boolean("is_primary").default(false),
  followerCount: integer("follower_count").default(0),
  subscriberCount: integer("subscriber_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
})

export const insertPlatformConnectionSchema = createInsertSchema(platformConnections).pick({
  userId: true,
  platform: true,
  platformUserId: true,
  platformUsername: true,
  accessToken: true,
  refreshToken: true,
  isPrimary: true,
})

// Stream stats schema
export const streamStats = pgTable("stream_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  platform: text("platform").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  peakViewers: integer("peak_viewers").default(0),
  averageViewers: integer("average_viewers").default(0),
  newFollowers: integer("new_followers").default(0),
  newSubscribers: integer("new_subscribers").default(0),
  chatMessages: integer("chat_messages").default(0),
  revenue: integer("revenue").default(0),
})

export const insertStreamStatsSchema = createInsertSchema(streamStats).pick({
  userId: true,
  title: true,
  platform: true,
  startTime: true,
})

// Goal schema
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  targetValue: integer("target_value").notNull(),
  currentValue: integer("current_value").default(0),
  goalType: text("goal_type").notNull(), // followers, subscribers, donations
  deadline: timestamp("deadline"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
})

export const insertGoalSchema = createInsertSchema(goals).pick({
  userId: true,
  title: true,
  targetValue: true,
  currentValue: true,
  goalType: true,
  deadline: true,
  isActive: true,
})

// Scheduled streams schema
export const scheduledStreams = pgTable("scheduled_streams", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  platforms: text("platforms").array().notNull(), // Array of platform names
  createdAt: timestamp("created_at").defaultNow(),
})

export const insertScheduledStreamSchema = createInsertSchema(scheduledStreams).pick({
  userId: true,
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  platforms: true,
})

// Automation schema
export const automations = pgTable("automations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  triggerType: text("trigger_type").notNull(), // follower, subscriber, timer, etc.
  triggerValue: text("trigger_value"), // JSON or specific value depending on trigger type
  actionType: text("action_type").notNull(), // chat_message, overlay, sound, etc.
  actionData: jsonb("action_data").notNull(), // Configuration for the action
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
})

export const insertAutomationSchema = createInsertSchema(automations).pick({
  userId: true,
  name: true,
  description: true,
  triggerType: true,
  triggerValue: true,
  actionType: true,
  actionData: true,
  isActive: true,
})

// Chat message schema (for historical tracking)
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  platform: text("platform").notNull(),
  senderUsername: text("sender_username").notNull(),
  senderDisplayName: text("sender_display_name").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  userBadges: jsonb("user_badges"),
})

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  userId: true,
  platform: true,
  senderUsername: true,
  senderDisplayName: true,
  message: true,
  timestamp: true,
  userBadges: true,
})

// Follower/subscriber tracking
export const followers = pgTable("followers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  platformConnectionId: integer("platform_connection_id")
    .notNull()
    .references(() => platformConnections.id),
  followerUsername: text("follower_username").notNull(),
  followerDisplayName: text("follower_display_name"),
  followedAt: timestamp("followed_at").notNull(),
})

export const insertFollowerSchema = createInsertSchema(followers).pick({
  userId: true,
  platformConnectionId: true,
  followerUsername: true,
  followerDisplayName: true,
  followedAt: true,
})

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  platformConnectionId: integer("platform_connection_id")
    .notNull()
    .references(() => platformConnections.id),
  subscriberUsername: text("subscriber_username").notNull(),
  subscriberDisplayName: text("subscriber_display_name"),
  tier: text("tier"),
  subscribedAt: timestamp("subscribed_at").notNull(),
  renewsAt: timestamp("renews_at"),
  isGift: boolean("is_gift").default(false),
})

export const insertSubscriberSchema = createInsertSchema(subscribers).pick({
  userId: true,
  platformConnectionId: true,
  subscriberUsername: true,
  subscriberDisplayName: true,
  tier: true,
  subscribedAt: true,
  renewsAt: true,
  isGift: true,
})

// Types
export type User = typeof users.$inferSelect
export type InsertUser = z.infer<typeof insertUserSchema>

export type PlatformConnection = typeof platformConnections.$inferSelect
export type InsertPlatformConnection = z.infer<typeof insertPlatformConnectionSchema>

export type StreamStats = typeof streamStats.$inferSelect
export type InsertStreamStats = z.infer<typeof insertStreamStatsSchema>

export type Goal = typeof goals.$inferSelect
export type InsertGoal = z.infer<typeof insertGoalSchema>

export type ScheduledStream = typeof scheduledStreams.$inferSelect
export type InsertScheduledStream = z.infer<typeof insertScheduledStreamSchema>

export type Automation = typeof automations.$inferSelect
export type InsertAutomation = z.infer<typeof insertAutomationSchema>

export type ChatMessage = typeof chatMessages.$inferSelect
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>

export type Follower = typeof followers.$inferSelect
export type InsertFollower = z.infer<typeof insertFollowerSchema>

export type Subscriber = typeof subscribers.$inferSelect
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>

// Competitions schema
export const competitions = pgTable("competitions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  competitionType: text("competition_type").notNull(), // extended, standard, tournament
  entryMethods: jsonb("entry_methods").notNull(), // array of entry methods with point values
  prizes: jsonb("prizes").notNull(), // array of prizes
  dailySecretWords: jsonb("daily_secret_words"), // array of { date, word } objects
  socialIntegrations: jsonb("social_integrations"), // array of tracked social posts
  watchTimeMultiplier: integer("watch_time_multiplier").default(1), // points per minute watched
  createdAt: timestamp("created_at").defaultNow(),
})

export const insertCompetitionSchema = createInsertSchema(competitions).pick({
  userId: true,
  title: true,
  description: true,
  startDate: true,
  endDate: true,
  isActive: true,
  competitionType: true,
  entryMethods: true,
  prizes: true,
  dailySecretWords: true,
  socialIntegrations: true,
  watchTimeMultiplier: true,
})

// Competition entries schema
export const competitionEntries = pgTable("competition_entries", {
  id: serial("id").primaryKey(),
  competitionId: integer("competition_id")
    .notNull()
    .references(() => competitions.id),
  participantName: text("participant_name").notNull(),
  participantPlatform: text("participant_platform").notNull(),
  participantId: text("participant_id").notNull(),
  totalPoints: integer("total_points").notNull().default(0),
  entries: jsonb("entries").notNull(), // detailed log of all entries
  watchTimeMinutes: integer("watch_time_minutes").notNull().default(0),
  secretWordsUsed: jsonb("secret_words_used"), // array of words used
  socialInteractions: jsonb("social_interactions"), // social media interactions
  isWinner: boolean("is_winner").default(false),
  prizeAwarded: text("prize_awarded"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const insertCompetitionEntrySchema = createInsertSchema(competitionEntries).pick({
  competitionId: true,
  participantName: true,
  participantPlatform: true,
  participantId: true,
  totalPoints: true,
  entries: true,
  watchTimeMinutes: true,
  secretWordsUsed: true,
  socialInteractions: true,
  isWinner: true,
  prizeAwarded: true,
})

// Standard giveaways schema
export const giveaways = pgTable("giveaways", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  entryMethod: text("entry_method").notNull(), // keyword, automatic, subscribers_only, followers_only
  eligiblePlatforms: jsonb("eligible_platforms").notNull(), // array of platforms
  prize: text("prize"),
  prizeUrl: text("prize_url"),
  prizeImages: jsonb("prize_images").$type<string[]>(),
  entryCriteria:
    jsonb("entry_criteria").$type<
      {
        type: string
        platform: string
        requirement: string
        points: number
      }[]
    >(),
  winner: jsonb("winner"), // winner info
  createdAt: timestamp("created_at").defaultNow(),
})

export const insertGiveawaySchema = createInsertSchema(giveaways).pick({
  userId: true,
  title: true,
  description: true,
  startDate: true,
  endDate: true,
  isActive: true,
  entryMethod: true,
  eligiblePlatforms: true,
  prize: true,
  winner: true,
})

// Types for competitions
export type Competition = typeof competitions.$inferSelect
export type InsertCompetition = z.infer<typeof insertCompetitionSchema>

export type CompetitionEntry = typeof competitionEntries.$inferSelect
export type InsertCompetitionEntry = z.infer<typeof insertCompetitionEntrySchema>

export type Giveaway = typeof giveaways.$inferSelect
export type InsertGiveaway = z.infer<typeof insertGiveawaySchema>

// Enums and constants
export const PlatformType = {
  TWITCH: "twitch",
  YOUTUBE: "youtube",
  FACEBOOK: "facebook",
  TWITTER: "twitter",
  INSTAGRAM: "instagram",
  TIKTOK: "tiktok",
  RESTREAM: "restream",
} as const

export const SubscriptionType = {
  FREE: "free",
  PREMIUM: "premium",
} as const

// Add subscription schema
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  paypalOrderId: text("paypal_order_id"),
  createdAt: timestamp("created_at").defaultNow(),
})

export const GoalType = {
  FOLLOWERS: "followers",
  SUBSCRIBERS: "subscribers",
  DONATIONS: "donations",
} as const

export const TriggerType = {
  FOLLOWER: "follower",
  SUBSCRIBER: "subscriber",
  DONATION: "donation",
  TIMER: "timer",
  CHAT_COMMAND: "chat_command",
} as const

export const ActionType = {
  CHAT_MESSAGE: "chat_message",
  OVERLAY: "overlay",
  SOUND: "sound",
  CUSTOM_API: "custom_api",
} as const

export const CompetitionType = {
  STANDARD: "standard",
  EXTENDED: "extended",
  TOURNAMENT: "tournament",
} as const

export const EntryMethodType = {
  KEYWORD: "keyword",
  AUTOMATIC: "automatic",
  SUBSCRIBERS_ONLY: "subscribers_only",
  FOLLOWERS_ONLY: "followers_only",
  SECRET_WORD: "secret_word",
  WATCH_TIME: "watch_time",
  SOCIAL_MEDIA: "social_media",
} as const

export const SecretWordFrequency = {
  SINGLE: "single",
  DAILY: "daily",
  MULTIPLE_DAILY: "multiple_daily",
  WEEKLY: "weekly",
} as const

export type SecretWordConfig = {
  frequency: keyof typeof SecretWordFrequency
  words: string[]
  maxDaily?: number
}

export type Platform = "twitch" | "youtube" | "facebook" | "tiktok" | "instagram"

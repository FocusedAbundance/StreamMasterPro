// Mock platform APIs for simulating platform interactions
// In a real app, these would connect to actual platform APIs

import { useWebSocketStore } from "./websocket"

// Generate a random number between min and max
const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// Generate a random user for simulated events
const generateRandomUser = (platform: string) => {
  const id = getRandomInt(1000, 9999)

  let username
  if (platform === "twitch") {
    username = `TwitchUser${id}`
  } else if (platform === "youtube") {
    username = `YTFan${id}`
  } else {
    username = `FBViewer${id}`
  }

  return {
    id: `${platform}_${id}`,
    username,
    displayName: username,
  }
}

export const useTwitchApi = () => {
  const sendStreamEvent = useWebSocketStore((state) => state.sendStreamEvent)
  const sendChatMessage = useWebSocketStore((state) => state.sendChatMessage)

  return {
    simulateFollow: () => {
      const user = generateRandomUser("twitch")
      sendStreamEvent("follow", "twitch", {
        username: user.username,
        displayName: user.displayName,
        followDate: new Date().toISOString(),
      })
    },

    simulateSubscription: (tier = "1", isGift = false) => {
      const user = generateRandomUser("twitch")
      sendStreamEvent("subscription", "twitch", {
        username: user.username,
        displayName: user.displayName,
        tier,
        isGift,
        months: getRandomInt(1, 24),
        subscribedAt: new Date().toISOString(),
      })
    },

    simulateChatMessage: (message: string) => {
      const user = generateRandomUser("twitch")
      const badges: Record<string, string> = {}

      if (Math.random() > 0.7) {
        badges.subscriber = String(getRandomInt(1, 36))
      }

      if (Math.random() > 0.9) {
        badges.moderator = "1"
      }

      sendChatMessage("twitch", message, user.username, user.displayName, badges)
    },

    simulateCheer: (amount?: number) => {
      const user = generateRandomUser("twitch")
      const cheerAmount = amount || getRandomInt(100, 5000)
      sendStreamEvent("cheer", "twitch", {
        username: user.username,
        displayName: user.displayName,
        amount: cheerAmount,
        message: `Cheer${cheerAmount} Great stream!`,
      })
    },

    simulateRaid: (viewers?: number) => {
      const user = generateRandomUser("twitch")
      const viewerCount = viewers || getRandomInt(5, 100)
      sendStreamEvent("raid", "twitch", {
        username: user.username,
        displayName: user.displayName,
        viewers: viewerCount,
      })
    },
  }
}

export const useYouTubeApi = () => {
  const sendStreamEvent = useWebSocketStore((state) => state.sendStreamEvent)
  const sendChatMessage = useWebSocketStore((state) => state.sendChatMessage)

  return {
    simulateSubscription: () => {
      const user = generateRandomUser("youtube")
      sendStreamEvent("subscription", "youtube", {
        username: user.username,
        displayName: user.displayName,
        subscribedAt: new Date().toISOString(),
      })
    },

    simulateMembership: (tier = "level1") => {
      const user = generateRandomUser("youtube")
      sendStreamEvent("membership", "youtube", {
        username: user.username,
        displayName: user.displayName,
        tier,
        months: getRandomInt(1, 12),
        subscribedAt: new Date().toISOString(),
      })
    },

    simulateChatMessage: (message: string) => {
      const user = generateRandomUser("youtube")
      const badges: Record<string, string> = {}

      if (Math.random() > 0.7) {
        badges.member = String(getRandomInt(1, 24))
      }

      if (Math.random() > 0.9) {
        badges.moderator = "1"
      }

      sendChatMessage("youtube", message, user.username, user.displayName, badges)
    },

    simulateSuperchat: (amount?: number) => {
      const user = generateRandomUser("youtube")
      const donationAmount = amount || getRandomInt(5, 100)
      sendStreamEvent("superchat", "youtube", {
        username: user.username,
        displayName: user.displayName,
        amount: donationAmount,
        currency: "USD",
        message: "Keep up the good work!",
      })
    },
  }
}

export const useTikTokApi = () => {
  const sendStreamEvent = useWebSocketStore((state) => state.sendStreamEvent)
  const sendChatMessage = useWebSocketStore((state) => state.sendChatMessage)

  return {
    simulateFollow: () => {
      const user = generateRandomUser("tiktok")
      sendStreamEvent("follow", "tiktok", {
        username: user.username,
        displayName: user.displayName,
        followDate: new Date().toISOString(),
      })
    },

    simulateLike: () => {
      const user = generateRandomUser("tiktok")
      sendStreamEvent("like", "tiktok", {
        username: user.username,
        displayName: user.displayName,
        amount: getRandomInt(1, 100),
      })
    },

    simulateChatMessage: (message: string) => {
      const user = generateRandomUser("tiktok")
      const badges: Record<string, string> = {}

      if (Math.random() > 0.8) {
        badges.moderator = "1"
      }

      sendChatMessage("tiktok", message, user.username, user.displayName, badges)
    },

    simulateGift: (amount?: number) => {
      const user = generateRandomUser("tiktok")
      const giftAmount = amount || getRandomInt(1, 1000)
      sendStreamEvent("gift", "tiktok", {
        username: user.username,
        displayName: user.displayName,
        amount: giftAmount,
        giftName: "Rose",
      })
    },
  }
}

export const useInstagramApi = () => {
  const sendStreamEvent = useWebSocketStore((state) => state.sendStreamEvent)
  const sendChatMessage = useWebSocketStore((state) => state.sendChatMessage)

  return {
    simulateFollow: () => {
      const user = generateRandomUser("instagram")
      sendStreamEvent("follow", "instagram", {
        username: user.username,
        displayName: user.displayName,
        followDate: new Date().toISOString(),
      })
    },

    simulateLike: () => {
      const user = generateRandomUser("instagram")
      sendStreamEvent("like", "instagram", {
        username: user.username,
        displayName: user.displayName,
        amount: getRandomInt(1, 100),
      })
    },

    simulateChatMessage: (message: string) => {
      const user = generateRandomUser("instagram")
      const badges: Record<string, string> = {}

      if (Math.random() > 0.8) {
        badges.verified = "1"
      }

      sendChatMessage("instagram", message, user.username, user.displayName, badges)
    },
  }
}

export const useFacebookApi = () => {
  const sendStreamEvent = useWebSocketStore((state) => state.sendStreamEvent)
  const sendChatMessage = useWebSocketStore((state) => state.sendChatMessage)

  return {
    simulateFollow: () => {
      const user = generateRandomUser("facebook")
      sendStreamEvent("follow", "facebook", {
        username: user.username,
        displayName: user.displayName,
        followDate: new Date().toISOString(),
      })
    },

    simulateSubscription: () => {
      const user = generateRandomUser("facebook")
      sendStreamEvent("subscription", "facebook", {
        username: user.username,
        displayName: user.displayName,
        subscribedAt: new Date().toISOString(),
      })
    },

    simulateChatMessage: (message: string) => {
      const user = generateRandomUser("facebook")
      const badges: Record<string, string> = {}

      if (Math.random() > 0.8) {
        badges.subscriber = "1"
      }

      sendChatMessage("facebook", message, user.username, user.displayName, badges)
    },

    simulateStars: (amount?: number) => {
      const user = generateRandomUser("facebook")
      const starsAmount = amount || getRandomInt(50, 1000)
      sendStreamEvent("stars", "facebook", {
        username: user.username,
        displayName: user.displayName,
        amount: starsAmount,
        message: "Amazing content!",
      })
    },
  }
}

// Simulated stream statistics updater
export const useStreamStats = () => {
  const updateStreamStatus = useWebSocketStore((state) => state.updateStreamStatus)

  return {
    startStream: (platform: string, title: string) => {
      updateStreamStatus("live", platform, title)
    },

    endStream: (platform: string) => {
      updateStreamStatus("offline", platform)
    },

    updateStats: (
      platform: string,
      stats: {
        peakViewers?: number
        averageViewers?: number
        newFollowers?: number
        newSubscribers?: number
        chatMessages?: number
        revenue?: number
      },
    ) => {
      updateStreamStatus("live", platform, undefined, stats)
    },
  }
}

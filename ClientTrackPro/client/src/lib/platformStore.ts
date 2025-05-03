import { create } from "zustand"

export type PlatformType = "streaming" | "social" | "software"

export interface ConnectedPlatform {
  id: string
  type: PlatformType
  username: string
  isPrimary?: boolean
  followerCount?: number
  subscriberCount?: number
}

interface PlatformState {
  connectedPlatforms: ConnectedPlatform[]
  addPlatform: (platform: ConnectedPlatform) => void
  removePlatform: (platformId: string) => void
  setPrimaryPlatform: (platformId: string) => void
  isPlatformConnected: (platformId: string) => boolean
  getConnectedPlatforms: (type?: PlatformType) => ConnectedPlatform[]
}

export const usePlatformStore = create<PlatformState>((set, get) => ({
  // Initial connected platforms
  connectedPlatforms: [
    {
      id: "twitch",
      type: "streaming",
      username: "GamerPro123",
      isPrimary: true,
      followerCount: 24531,
      subscriberCount: 437,
    },
    {
      id: "youtube",
      type: "streaming",
      username: "GamerPro123",
      isPrimary: false,
      followerCount: 12785,
      subscriberCount: 215,
    },
    {
      id: "facebook",
      type: "streaming",
      username: "GamerPro123",
      isPrimary: false,
      followerCount: 8429,
      subscriberCount: 126,
    },
    {
      id: "instagram",
      type: "social",
      username: "GamerPro123",
    },
    {
      id: "twitter",
      type: "social",
      username: "GamerPro123",
    },
    {
      id: "discord",
      type: "social",
      username: "GamerPro123",
    },
    {
      id: "tiktok",
      type: "social",
      username: "GamerPro123",
    },
    {
      id: "obs",
      type: "software",
      username: "OBS Studio v29.1.3",
    },
  ],

  addPlatform: (platform) =>
    set((state) => ({
      connectedPlatforms: [...state.connectedPlatforms, platform],
    })),

  removePlatform: (platformId) =>
    set((state) => ({
      connectedPlatforms: state.connectedPlatforms.filter((p) => p.id !== platformId),
    })),

  setPrimaryPlatform: (platformId) =>
    set((state) => ({
      connectedPlatforms: state.connectedPlatforms.map((p) => ({
        ...p,
        isPrimary: p.id === platformId,
      })),
    })),

  isPlatformConnected: (platformId) => {
    return get().connectedPlatforms.some((p) => p.id === platformId)
  },

  getConnectedPlatforms: (type) => {
    return type ? get().connectedPlatforms.filter((p) => p.type === type) : get().connectedPlatforms
  },
}))

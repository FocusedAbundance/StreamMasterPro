import { create } from "zustand"
import { persist } from "zustand/middleware"

export type SubscriptionTier = "free" | "streamer" | "mogul"

interface SubscriptionState {
  currentTier: SubscriptionTier
  expiryDate: Date | null
  isYearly: boolean

  // Actions
  setSubscription: (tier: SubscriptionTier, expiryDate: Date | null, isYearly: boolean) => void
  cancelSubscription: () => void

  // Feature access checks
  canStreamToMultiplePlatforms: () => boolean
  getMaxStreamPlatforms: () => number
  canUseMultiChat: () => boolean
  canCustomizeDataDisplays: () => boolean
  getMaxCompetitionDuration: () => number // in days
  canRunCustomCompetitions: () => boolean
  hasFullAccess: () => boolean
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      currentTier: "free",
      expiryDate: null,
      isYearly: false,

      setSubscription: (tier, expiryDate, isYearly) =>
        set({
          currentTier: tier,
          expiryDate,
          isYearly,
        }),

      cancelSubscription: () =>
        set({
          currentTier: "free",
          expiryDate: null,
          isYearly: false,
        }),

      canStreamToMultiplePlatforms: () => {
        const { currentTier } = get()
        return currentTier === "streamer" || currentTier === "mogul"
      },

      getMaxStreamPlatforms: () => {
        const { currentTier } = get()
        switch (currentTier) {
          case "free":
            return 1
          case "streamer":
            return 3
          case "mogul":
            return Number.POSITIVE_INFINITY // Unlimited
          default:
            return 0
        }
      },

      canUseMultiChat: () => {
        const { currentTier } = get()
        return currentTier === "streamer" || currentTier === "mogul"
      },

      canCustomizeDataDisplays: () => {
        const { currentTier } = get()
        return currentTier === "streamer" || currentTier === "mogul"
      },

      getMaxCompetitionDuration: () => {
        const { currentTier } = get()
        switch (currentTier) {
          case "free":
            return 1 / 24 // 1 hour (1/24 of a day)
          case "streamer":
            return 7 // 1 week
          case "mogul":
            return Number.POSITIVE_INFINITY // Unlimited
          default:
            return 0
        }
      },

      canRunCustomCompetitions: () => {
        const { currentTier } = get()
        return currentTier === "mogul"
      },

      hasFullAccess: () => {
        const { currentTier } = get()
        return currentTier === "mogul"
      },
    }),
    {
      name: "subscription-storage",
      partialize: (state) => ({
        currentTier: state.currentTier,
        expiryDate: state.expiryDate ? state.expiryDate.toISOString() : null,
        isYearly: state.isYearly,
      }),
      onRehydrateStorage: () => (state) => {
        // Convert ISO string back to Date object
        if (state && state.expiryDate) {
          state.expiryDate = new Date(state.expiryDate)
        }
      },
    },
  ),
)

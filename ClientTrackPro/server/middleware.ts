import type { Request, Response, NextFunction } from "express"
import { storage } from "./storage"

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const userId = req.headers["x-user-id"]
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const user = await storage.getUser(Number.parseInt(userId as string))
  if (!user) {
    return res.status(401).json({ message: "User not found" })
  }

  const subscription = await storage.getCurrentSubscription(user.id)
  req.user = user
  req.subscription = subscription

  next()
}

export async function premiumCheck(req: Request, res: Response, next: NextFunction) {
  if (!req.subscription || req.subscription.type !== "premium") {
    return res.status(403).json({
      message: "This feature requires a premium subscription",
      upgrade: true,
    })
  }
  next()
}

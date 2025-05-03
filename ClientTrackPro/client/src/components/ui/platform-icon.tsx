import type React from "react"
import {
  SiTwitch,
  SiYoutube,
  SiFacebook,
  SiTiktok,
  SiInstagram,
  SiTwitter,
  SiObsstudio,
  SiStreamlabs,
  SiXsplit,
  SiDiscord,
  SiLinkedin,
  SiReddit,
} from "react-icons/si"
import { FaStream } from "react-icons/fa"

interface PlatformIconProps {
  platform: string
  size?: number
  className?: string
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, size = 18, className = "" }) => {
  switch (platform.toLowerCase()) {
    // Streaming platforms
    case "twitch":
      return <SiTwitch size={size} className={`text-[#9146FF] ${className}`} />
    case "youtube":
      return <SiYoutube size={size} className={`text-[#FF0000] ${className}`} />
    case "facebook":
      return <SiFacebook size={size} className={`text-[#1877F2] ${className}`} />
    case "tiktok":
      return <SiTiktok size={size} className={`text-black ${className}`} />
    case "instagram":
      return <SiInstagram size={size} className={`text-[#E4405F] ${className}`} />
    case "twitter":
      return <SiTwitter size={size} className={`text-[#1DA1F2] ${className}`} />
    case "discord":
      return <SiDiscord size={size} className={`text-[#5865F2] ${className}`} />
    case "linkedin":
      return <SiLinkedin size={size} className={`text-[#0A66C2] ${className}`} />
    case "reddit":
      return <SiReddit size={size} className={`text-[#FF4500] ${className}`} />

    // Streaming software
    case "obs":
      return <SiObsstudio size={size} className={`text-[#302E31] ${className}`} />
    case "streamlabs":
      return <SiStreamlabs size={size} className={`text-[#80F5D2] ${className}`} />
    case "xsplit":
      return <SiXsplit size={size} className={`text-[#0095DE] ${className}`} />
    case "lightstream":
    case "vmix":
    case "wirecast":
      return <FaStream size={size} className={`text-gray-700 ${className}`} />

    default:
      return <FaStream size={size} className={`text-gray-500 ${className}`} />
  }
}

// Platform color mapping for consistent styling
export const getPlatformColor = (platform: string): string => {
  switch (platform.toLowerCase()) {
    case "twitch":
      return "bg-[#9146FF]"
    case "youtube":
      return "bg-[#FF0000]"
    case "facebook":
      return "bg-[#1877F2]"
    case "tiktok":
      return "bg-black"
    case "instagram":
      return "bg-gradient-to-r from-[#FCAF45] via-[#E4405F] to-[#8A3AB9]"
    case "twitter":
      return "bg-[#1DA1F2]"
    case "discord":
      return "bg-[#5865F2]"
    case "linkedin":
      return "bg-[#0A66C2]"
    case "reddit":
      return "bg-[#FF4500]"
    default:
      return "bg-gray-500"
  }
}

// Platform name mapping for consistent naming
export const getPlatformName = (platform: string): string => {
  switch (platform.toLowerCase()) {
    case "twitch":
      return "Twitch"
    case "youtube":
      return "YouTube"
    case "facebook":
      return "Facebook Gaming"
    case "tiktok":
      return "TikTok"
    case "instagram":
      return "Instagram"
    case "twitter":
      return "Twitter"
    case "discord":
      return "Discord"
    case "linkedin":
      return "LinkedIn"
    case "reddit":
      return "Reddit"
    case "obs":
      return "OBS Studio"
    case "streamlabs":
      return "Streamlabs"
    case "xsplit":
      return "XSplit"
    case "lightstream":
      return "Lightstream"
    case "vmix":
      return "vMix"
    case "wirecast":
      return "Wirecast"
    default:
      return platform
  }
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { PlatformIcon } from "@/components/ui/platform-icon"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Trash2, X } from "lucide-react"
import type { PlatformConnectionType, SecretWordFrequency } from "@shared/schema"
import { Gift, Clock, Users, Settings, Copy, CheckCircle, List, Shuffle, Play, RotateCcw } from "lucide-react"

const GiveawaysPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("create")
  const [isGiveawayActive, setIsGiveawayActive] = useState(false)
  const [giveawayProgress, setGiveawayProgress] = useState(0)
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null)
  const [showDurationDialog, setShowDurationDialog] = useState(false)
  const [showEntryCriteriaDialog, setShowEntryCriteriaDialog] = useState(false)
  const [customDuration, setCustomDuration] = useState("")
  const [customDurationType, setCustomDurationType] = useState("days")
  const [prizeImages, setPrizeImages] = useState<string[]>([])
  const [entryCriteria, setEntryCriteria] = useState<
    Array<{
      platform: string
      type: string
      requirement: string
      points: number
    }>
  >([])
  const [giveawayDescription, setGiveawayDescription] = useState("")
  const [selectedDuration, setSelectedDuration] = useState("15")
  const [entryMethod, setEntryMethod] = useState("keyword")
  const [secretWordFrequency, setSecretWordFrequency] = useState<keyof typeof SecretWordFrequency>("SINGLE")
  const [maxDailyWords, setMaxDailyWords] = useState(1)
  const [secretWords, setSecretWords] = useState<string[]>([""])
  const [showSecretWordConfig, setShowSecretWordConfig] = useState(false)

  useEffect(() => {
    if (entryMethod === "secret_word") {
      setShowSecretWordConfig(true)
      if (secretWords.length === 0) {
        setSecretWords([""])
      }
    } else {
      setShowSecretWordConfig(false)
    }
  }, [entryMethod])

  const { data: connections } = useQuery<PlatformConnectionType[]>({
    queryKey: ["/api/users/1/platforms"],
  })

  const getPlatformActions = (platform: string) => {
    const commonActions = [
      {
        value: "watch_time",
        label: "Watch Time",
        requiresInput: true,
        inputType: "number",
        inputLabel: "Minutes Required",
        points: 1,
      },
      {
        value: "secret_word",
        label: "Secret Word",
        requiresInput: true,
        inputType: "text",
        inputLabel: "Word to Type",
        points: 5,
      },
    ]

    const platformActions = {
      twitch: [
        { value: "follow", label: "Follow Channel", requiresInput: false, points: 10 },
        { value: "subscribe", label: "Subscribe", requiresInput: false, points: 20 },
        {
          value: "chat_activity",
          label: "Chat Messages",
          requiresInput: true,
          inputType: "number",
          inputLabel: "Number of Messages",
          points: 1,
        },
      ],
      youtube: [
        { value: "subscribe", label: "Subscribe", requiresInput: false, points: 10 },
        {
          value: "like_video",
          label: "Like Video",
          requiresInput: true,
          inputType: "text",
          inputLabel: "Video URL",
          points: 5,
        },
        {
          value: "comment_video",
          label: "Comment on Video",
          requiresInput: true,
          inputType: "text",
          inputLabel: "Video URL",
          points: 5,
        },
      ],
      facebook: [
        { value: "follow_page", label: "Follow Page", requiresInput: false, points: 10 },
        {
          value: "like_post",
          label: "Like Post",
          requiresInput: true,
          inputType: "text",
          inputLabel: "Post URL",
          points: 5,
        },
        {
          value: "share_post",
          label: "Share Post",
          requiresInput: true,
          inputType: "text",
          inputLabel: "Post URL",
          points: 15,
        },
      ],
      tiktok: [
        { value: "follow", label: "Follow", requiresInput: false, points: 10 },
        {
          value: "like_video",
          label: "Like Video",
          requiresInput: true,
          inputType: "text",
          inputLabel: "Video URL",
          points: 5,
        },
        {
          value: "comment",
          label: "Comment",
          requiresInput: true,
          inputType: "text",
          inputLabel: "Video URL",
          points: 5,
        },
      ],
      instagram: [
        { value: "follow", label: "Follow", requiresInput: false, points: 10 },
        {
          value: "like_post",
          label: "Like Post",
          requiresInput: true,
          inputType: "text",
          inputLabel: "Post URL",
          points: 5,
        },
        {
          value: "comment",
          label: "Comment",
          requiresInput: true,
          inputType: "text",
          inputLabel: "Post URL",
          points: 5,
        },
      ],
    }

    return [...commonActions, ...(platformActions[platform as keyof typeof platformActions] || [])]
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPrizeImages((prev) => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setPrizeImages((prev) => prev.filter((_, i) => i !== index))
  }

  const addCriteria = () => {
    setEntryCriteria((prev) => [
      ...prev,
      {
        platform: "twitch",
        type: "watch_time",
        requirement: "",
        points: 1,
      },
    ])
  }

  const removeCriteria = (index: number) => {
    setEntryCriteria((prev) => prev.filter((_, i) => i !== index))
  }

  const updateCriteria = (index: number, field: string, value: string | number) => {
    setEntryCriteria((prev) => prev.map((criteria, i) => (i === index ? { ...criteria, [field]: value } : criteria)))
  }

  const startGiveaway = () => {
    setIsGiveawayActive(true)
    setGiveawayProgress(0)
    setSelectedWinner(null)

    // Simulate giveaway progress using selected duration
    let totalSeconds = 0
    if (selectedDuration === "custom") {
      totalSeconds = Number.parseInt(customDuration) * (customDurationType === "days" ? 86400 : 604800)
    } else {
      totalSeconds = Number.parseInt(selectedDuration) * 60 //Minutes to seconds
    }

    const interval = setInterval(() => {
      setGiveawayProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          pickWinner()
          return 100
        }
        return prev + (1000 / totalSeconds) * 10 // Adjust progress based on total seconds
      })
    }, 1000)
  }

  const pickWinner = () => {
    // Simulate winner selection
    const participants = [
      "TwitchUser123",
      "YTGamer",
      "StreamFan99",
      "JohnDoe",
      "GamerPro456",
      "StreamerFan22",
      "LuckyViewer",
      "ChatterBox",
      "HappyFollower",
      "StreamSupporter",
    ]

    const winner = participants[Math.floor(Math.random() * participants.length)]
    setSelectedWinner(winner)
  }

  const resetGiveaway = () => {
    setIsGiveawayActive(false)
    setGiveawayProgress(0)
    setSelectedWinner(null)
  }

  return (
    <DashboardLayout title="Giveaways" subtitle="Set up and manage stream giveaways">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full">
          <TabsTrigger value="create" className="flex-1">
            <Gift size={16} className="mr-2" />
            Create Giveaway
          </TabsTrigger>
          <TabsTrigger value="active" className="flex-1">
            <Play size={16} className="mr-2" />
            Active Giveaway
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1">
            <List size={16} className="mr-2" />
            Giveaway History
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1">
            <Settings size={16} className="mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Giveaway</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Giveaway Title</label>
                <Input placeholder="e.g. Subscriber Steam Key Giveaway" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Prize Description</label>
                  <Input placeholder="e.g. Steam Key for Game Title" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Prize URL</label>
                  <Input placeholder="e.g. https://store.steampowered.com/app/..." />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Prize Images</label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="border rounded p-2"
                    />
                    {prizeImages.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {prizeImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img src={image} alt={`Prize ${index + 1}`} className="w-20 h-20 object-cover rounded" />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration</label>
                    <Select defaultValue="15" onValueChange={setSelectedDuration}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="10080">1 week</SelectItem>
                        <SelectItem value="43200">1 month</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedDuration === "custom" && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Duration"
                        value={customDuration}
                        onChange={(e) => setCustomDuration(e.target.value)}
                      />
                      <Select defaultValue="days" onValueChange={setCustomDurationType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Entry Methods</h3>
                  {["twitch", "youtube", "facebook", "tiktok", "instagram"].map((platform) => (
                    <Card key={platform} className="p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <PlatformIcon platform={platform} />
                        <h4 className="font-medium capitalize">{platform} Entry Methods</h4>
                      </div>

                      <div className="space-y-4">
                        {getPlatformActions(platform).map((action) => (
                          <div key={action.value} className="flex items-center gap-4">
                            <Switch
                              checked={entryCriteria.some((c) => c.platform === platform && c.type === action.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setEntryCriteria((prev) => [
                                    ...prev,
                                    {
                                      platform: platform,
                                      type: action.value,
                                      requirement: "",
                                      points: action.points,
                                    },
                                  ])
                                } else {
                                  setEntryCriteria((prev) =>
                                    prev.filter((c) => !(c.platform === platform && c.type === action.value)),
                                  )
                                }
                              }}
                            />
                            <div className="flex-1">
                              <label className="text-sm font-medium">{action.label}</label>
                              {action.requiresInput && (
                                <Input
                                  type={action.inputType}
                                  placeholder={action.inputLabel}
                                  className="mt-2"
                                  value={
                                    entryCriteria.find(
                                      (c) => c.platform === connection.platform && c.type === action.value,
                                    )?.requirement || ""
                                  }
                                  onChange={(e) => {
                                    setEntryCriteria((prev) =>
                                      prev.map((c) =>
                                        c.platform === connection.platform && c.type === action.value
                                          ? { ...c, requirement: e.target.value }
                                          : c,
                                      ),
                                    )
                                  }}
                                />
                              )}
                            </div>
                            <div className="w-32">
                              <Input
                                type="number"
                                placeholder="Points"
                                value={
                                  entryCriteria.find(
                                    (c) => c.platform === connection.platform && c.type === action.value,
                                  )?.points || action.points
                                }
                                onChange={(e) => {
                                  setEntryCriteria((prev) =>
                                    prev.map((c) =>
                                      c.platform === connection.platform && c.type === action.value
                                        ? { ...c, points: Number.parseInt(e.target.value) }
                                        : c,
                                    ),
                                  )
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>

                <Dialog open={showDurationDialog} onOpenChange={setShowDurationDialog}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Custom Duration</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          type="number"
                          placeholder="Duration"
                          value={customDuration}
                          onChange={(e) => setCustomDuration(e.target.value)}
                        />
                        <Select defaultValue="days" onValueChange={setCustomDurationType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="days">Days</SelectItem>
                            <SelectItem value="weeks">Weeks</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => setShowDurationDialog(false)}>Continue</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={showEntryCriteriaDialog} onOpenChange={setShowEntryCriteriaDialog}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Entry Criteria</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground mb-4">
                        Add ways for viewers to earn entries. Points determine entry weight in the final drawing.
                      </div>
                      {entryCriteria.map((criteria, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Select
                            value={criteria.platform}
                            onValueChange={(value) => updateCriteria(index, "platform", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Platform" />
                            </SelectTrigger>
                            <SelectContent>
                              {connections?.map((conn) => (
                                <SelectItem key={conn.platform} value={conn.platform}>
                                  <div className="flex items-center">
                                    <PlatformIcon platform={conn.platform} className="mr-2" />
                                    {conn.platform.charAt(0).toUpperCase() + conn.platform.slice(1)}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={criteria.type} onValueChange={(value) => updateCriteria(index, "type", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Action Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {getPlatformActions(criteria.platform).map((action) => (
                                <SelectItem key={action.value} value={action.value}>
                                  {action.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {getPlatformActions(criteria.platform).find((a) => a.value === criteria.type)
                            ?.requiresInput && (
                            <Input
                              placeholder={
                                getPlatformActions(criteria.platform).find((a) => a.value === criteria.type)?.inputLabel
                              }
                              type={
                                getPlatformActions(criteria.platform).find((a) => a.value === criteria.type)?.inputType
                              }
                              value={criteria.requirement}
                              onChange={(e) => updateCriteria(index, "requirement", e.target.value)}
                            />
                          )}
                          <Input
                            type="number"
                            placeholder="Points"
                            value={criteria.points}
                            onChange={(e) => updateCriteria(index, "points", e.target.value)}
                          />
                          <Button variant="destructive" size="icon" onClick={() => removeCriteria(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button onClick={addCriteria}>Add Entry Criteria</Button>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => setShowEntryCriteriaDialog(false)}>Done</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Entry Method</label>
                    <Select
                      value={entryMethod}
                      onValueChange={(value) => {
                        setEntryMethod(value)
                        if (value === "secret_word") {
                          setSecretWordFrequency("SINGLE")
                          setSecretWords([""])
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select entry method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="keyword">Keyword (!enter)</SelectItem>
                        <SelectItem value="automatic">All viewers</SelectItem>
                        <SelectItem value="subs">Subscribers only</SelectItem>
                        <SelectItem value="followers">Followers only</SelectItem>
                        <SelectItem value="secret_word">Secret Words</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {showSecretWordConfig && (
                    <div className="space-y-4 border rounded-md p-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Secret Word Frequency</label>
                        <Select
                          value={secretWordFrequency}
                          onValueChange={(value: keyof typeof SecretWordFrequency) => {
                            setSecretWordFrequency(value)
                            if (value === "MULTIPLE_DAILY") {
                              setMaxDailyWords(2)
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SINGLE">Single Word</SelectItem>
                            <SelectItem value="DAILY">Daily Word</SelectItem>
                            <SelectItem value="MULTIPLE_DAILY">Multiple Daily Words</SelectItem>
                            <SelectItem value="WEEKLY">Weekly Word</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {secretWordFrequency === "MULTIPLE_DAILY" && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Maximum Daily Words</label>
                          <Input
                            type="number"
                            min="1"
                            value={maxDailyWords}
                            onChange={(e) => setMaxDailyWords(Math.max(1, Number.parseInt(e.target.value, 10)))}
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium mb-1">Secret Words</label>
                        <div className="space-y-2">
                          {secretWords.map((word, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={word}
                                placeholder={`Secret word ${index + 1}`}
                                onChange={(e) => {
                                  const newWords = [...secretWords]
                                  newWords[index] = e.target.value
                                  setSecretWords(newWords)
                                }}
                              />
                              {secretWords.length > 1 && (
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => {
                                    setSecretWords(secretWords.filter((_, i) => i !== index))
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={() => setSecretWords([...secretWords, ""])}
                            disabled={secretWordFrequency === "MULTIPLE_DAILY" && secretWords.length >= maxDailyWords}
                          >
                            Add Secret Word
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Giveaway Description for Viewers</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  placeholder="Describe how viewers can enter the giveaway..."
                  rows={4}
                  value={giveawayDescription}
                  onChange={(e) => setGiveawayDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Eligible Platforms</label>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="twitch" defaultChecked />
                    <label htmlFor="twitch" className="text-sm cursor-pointer flex items-center">
                      <PlatformIcon platform="twitch" className="mr-1" /> Twitch
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="youtube" defaultChecked />
                    <label htmlFor="youtube" className="text-sm cursor-pointer flex items-center">
                      <PlatformIcon platform="youtube" className="mr-1" /> YouTube
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="facebook" defaultChecked />
                    <label htmlFor="facebook" className="text-sm cursor-pointer flex items-center">
                      <PlatformIcon platform="facebook" className="mr-1" /> Facebook
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="tiktok" defaultChecked />
                    <label htmlFor="tiktok" className="text-sm cursor-pointer flex items-center">
                      <PlatformIcon platform="tiktok" className="mr-1" /> TikTok
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="instagram" defaultChecked />
                    <label htmlFor="instagram" className="text-sm cursor-pointer flex items-center">
                      <PlatformIcon platform="instagram" className="mr-1" /> Instagram
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  onClick={() => {
                    startGiveaway()
                    setActiveTab("active")
                  }}
                >
                  <Gift size={16} className="mr-2" />
                  Create & Start Giveaway
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Giveaway Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-border rounded-md p-4 hover:bg-accent cursor-pointer">
                  <h3 className="font-medium mb-2">Subscriber Only</h3>
                  <p className="text-sm text-muted-foreground mb-2">Exclusive giveaway for your subscribers</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock size={14} className="mr-1" /> 15 minutes
                  </div>
                </div>
                <div className="border border-border rounded-md p-4 hover:bg-accent cursor-pointer">
                  <h3 className="font-medium mb-2">Milestone Celebration</h3>
                  <p className="text-sm text-muted-foreground mb-2">Open giveaway for all viewers</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock size={14} className="mr-1" /> 30 minutes
                  </div>
                </div>
                <div className="border border-border rounded-md p-4 hover:bg-accent cursor-pointer">
                  <h3 className="font-medium mb-2">Quick Flash Giveaway</h3>
                  <p className="text-sm text-muted-foreground mb-2">Fast-paced giveaway with keyword entry</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock size={14} className="mr-1" /> 5 minutes
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {isGiveawayActive ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Subscriber Steam Key Giveaway</span>
                  {giveawayProgress < 100 ? (
                    <span className="text-sm font-normal px-2 py-1 bg-primary/20 text-primary rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="text-sm font-normal px-2 py-1 bg-green-500/20 text-green-500 rounded-full">
                      Completed
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {giveawayProgress < 100 ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Time Remaining</span>
                        <span className="font-medium">{Math.floor((100 - giveawayProgress) / 10)}:00</span>
                      </div>
                      <Progress value={giveawayProgress} />
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Users size={16} />
                        <span className="text-sm">42 participants</span>
                      </div>
                      <div className="text-sm">Entry: !enter</div>
                    </div>

                    <div className="pt-4 flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setGiveawayProgress(100)}>
                        End Early
                      </Button>
                      <Button variant="destructive" onClick={resetGiveaway}>
                        Cancel Giveaway
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {selectedWinner ? (
                      <div className="flex flex-col items-center py-8">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                          <CheckCircle size={32} className="text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Winner Selected!</h2>
                        <p className="text-lg mb-4">{selectedWinner}</p>
                        <div className="flex space-x-2">
                          <Button variant="outline" className="flex items-center">
                            <Copy size={16} className="mr-2" />
                            Copy Username
                          </Button>
                          <Button onClick={resetGiveaway}>
                            <RotateCcw size={16} className="mr-2" />
                            New Giveaway
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-8">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 animate-spin">
                          <Shuffle size={32} className="text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-6">Selecting Winner...</h2>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Gift size={32} className="text-muted-foreground" />
              </div>
              <h2 className="text-xl font-medium mb-2">No Active Giveaway</h2>
              <p className="text-muted-foreground mb-4">Create a new giveaway to get started</p>
              <Button onClick={() => setActiveTab("create")}>Create Giveaway</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Giveaway History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Subscriber Steam Key Giveaway</h3>
                    <p className="text-sm text-muted-foreground">Winner: StreamFan99</p>
                  </div>
                  <div className="text-sm text-muted-foreground">May 18, 2023</div>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">1,000 Followers Celebration</h3>
                    <p className="text-sm text-muted-foreground">Winner: LuckyViewer</p>
                  </div>
                  <div className="text-sm text-muted-foreground">May 5, 2023</div>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Gaming Headset Giveaway</h3>
                    <p className="text-sm text-muted-foreground">Winner: TwitchUser123</p>
                  </div>
                  <div className="text-sm text-muted-foreground">April 22, 2023</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Giveaway Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Chat Announcements</h3>
                  <p className="text-sm text-muted-foreground">Automatically announce giveaways in chat</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Winner Eligibility Verification</h3>
                  <p className="text-sm text-muted-foreground">Automatically check if users meet requirements</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Subscriber Bonus Entries</h3>
                  <p className="text-sm text-muted-foreground">Give subscribers higher chance to win</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Recent Winners Exclusion</h3>
                  <p className="text-sm text-muted-foreground">Prevent recent winners from winning again</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">On-Screen Animation</h3>
                  <p className="text-sm text-muted-foreground">Show winner announcement overlay on stream</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}

export default GiveawaysPage

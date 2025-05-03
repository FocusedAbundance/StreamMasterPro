"use client"

import type React from "react"
import { useState } from "react"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Users, UserPlus, Crown, Search, Download, MoreHorizontal, Mail, Tag, Filter } from "lucide-react"
import { PlatformIcon } from "@/components/ui/platform-icon"
import { useQuery } from "@tanstack/react-query"
import type { Follower, Subscriber } from "@shared/schema"
import { format } from "date-fns"

const FollowersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("followers")
  const [searchQuery, setSearchQuery] = useState("")
  const [platformFilter, setPlatformFilter] = useState("all")

  const { data: followers, isLoading: followersLoading } = useQuery<Follower[]>({
    queryKey: ["/api/users/1/followers", { limit: 50 }], // Using static user ID for demo
  })

  const { data: subscribers, isLoading: subscribersLoading } = useQuery<Subscriber[]>({
    queryKey: ["/api/users/1/subscribers", { limit: 50 }], // Using static user ID for demo
  })

  // Stats for top of the page
  const stats = {
    followers: {
      total: 45745,
      twitch: 24531,
      youtube: 12785,
      facebook: 8429,
      recentGrowth: "+1,245 this month",
    },
    subscribers: {
      total: 778,
      twitch: 437,
      youtube: 215,
      facebook: 126,
      recentGrowth: "+87 this month",
    },
  }

  // Sample follower data for display when API data is not yet loaded
  const sampleFollowers = Array(15)
    .fill(0)
    .map((_, i) => ({
      id: i + 1,
      followerUsername: `User${i + 100}`,
      followerDisplayName: `User ${i + 100}`,
      platform: i % 3 === 0 ? "twitch" : i % 3 === 1 ? "youtube" : "facebook",
      followedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    }))

  // Sample subscriber data for display when API data is not yet loaded
  const sampleSubscribers = Array(10)
    .fill(0)
    .map((_, i) => ({
      id: i + 1,
      subscriberUsername: `SubUser${i + 100}`,
      subscriberDisplayName: `Sub User ${i + 100}`,
      platform: i % 3 === 0 ? "twitch" : i % 3 === 1 ? "youtube" : "facebook",
      tier: i % 3 === 0 ? "1" : i % 3 === 1 ? "2" : "3",
      subscribedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      isGift: i % 5 === 0,
    }))

  const followersToDisplay = followers || sampleFollowers
  const subscribersToDisplay = subscribers || sampleSubscribers

  // Filter followers based on search and platform
  const filteredFollowers = followersToDisplay.filter((follower) => {
    const matchesSearch =
      searchQuery === "" ||
      follower.followerDisplayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      follower.followerUsername.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPlatform =
      platformFilter === "all" ||
      (platformFilter === "twitch" && follower.platform === "twitch") ||
      (platformFilter === "youtube" && follower.platform === "youtube") ||
      (platformFilter === "facebook" && follower.platform === "facebook")

    return matchesSearch && matchesPlatform
  })

  // Filter subscribers based on search and platform
  const filteredSubscribers = subscribersToDisplay.filter((subscriber) => {
    const matchesSearch =
      searchQuery === "" ||
      subscriber.subscriberDisplayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscriber.subscriberUsername.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPlatform =
      platformFilter === "all" ||
      (platformFilter === "twitch" && subscriber.platform === "twitch") ||
      (platformFilter === "youtube" && subscriber.platform === "youtube") ||
      (platformFilter === "facebook" && subscriber.platform === "facebook")

    return matchesSearch && matchesPlatform
  })

  const formatDate = (date: Date) => {
    return format(new Date(date), "MMM d, yyyy")
  }

  return (
    <DashboardLayout title="Followers Database" subtitle="Manage your community and analyze growth">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0 mb-4">
          <TabsList>
            <TabsTrigger value="followers" className="flex items-center">
              <UserPlus size={16} className="mr-2" />
              Followers
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="flex items-center">
              <Crown size={16} className="mr-2" />
              Subscribers
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap gap-2">
            <div className="relative w-full md:w-auto">
              <Search size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search followers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="twitch">Twitch</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Filter size={16} />
            </Button>

            <Button variant="outline" className="flex items-center">
              <Download size={16} className="mr-2" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        <TabsContent value="followers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Followers</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.followers.total.toLocaleString()}</h3>
                    <p className="text-xs text-green-500">{stats.followers.recentGrowth}</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Users size={24} className="text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <h3 className="text-sm font-medium mb-2">Platform Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <PlatformIcon platform="twitch" size={16} />
                      <span className="text-sm">Twitch</span>
                    </div>
                    <span className="text-sm font-medium">{stats.followers.twitch.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <PlatformIcon platform="youtube" size={16} />
                      <span className="text-sm">YouTube</span>
                    </div>
                    <span className="text-sm font-medium">{stats.followers.youtube.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <PlatformIcon platform="facebook" size={16} />
                      <span className="text-sm">Facebook</span>
                    </div>
                    <span className="text-sm font-medium">{stats.followers.facebook.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border lg:col-span-2">
              <CardContent className="pt-6">
                <h3 className="text-sm font-medium mb-2">Follower Growth</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: "75%" }}></div>
                  </div>
                  <span className="text-sm font-medium">75%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  You're gaining followers at a rate of 45 per day, which is 75% of your monthly goal.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle>Followers List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border">
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Platform</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Followed Date</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFollowers.map((follower, index) => (
                        <tr key={follower.id || index} className="border-t border-border">
                          <td className="p-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">
                                {follower.followerDisplayName?.charAt(0) || follower.followerUsername.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {follower.followerDisplayName || follower.followerUsername}
                                </div>
                                <div className="text-xs text-muted-foreground">@{follower.followerUsername}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-1">
                              <PlatformIcon platform={follower.platform} />
                              <span>{follower.platform.charAt(0).toUpperCase() + follower.platform.slice(1)}</span>
                            </div>
                          </td>
                          <td className="p-3">{formatDate(follower.followedAt)}</td>
                          <td className="p-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="flex items-center">
                                  <Tag className="mr-2 h-4 w-4" />
                                  <span>Add Tag</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center">
                                  <Mail className="mr-2 h-4 w-4" />
                                  <span>Send Message</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center text-red-500">
                                  <Users className="mr-2 h-4 w-4" />
                                  <span>Remove</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{filteredFollowers.length}</span> of{" "}
                  <span className="font-medium">{followersToDisplay.length}</span> results
                </p>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Subscribers</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.subscribers.total.toLocaleString()}</h3>
                    <p className="text-xs text-green-500">{stats.subscribers.recentGrowth}</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Crown size={24} className="text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <h3 className="text-sm font-medium mb-2">Platform Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <PlatformIcon platform="twitch" size={16} />
                      <span className="text-sm">Twitch</span>
                    </div>
                    <span className="text-sm font-medium">{stats.subscribers.twitch.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <PlatformIcon platform="youtube" size={16} />
                      <span className="text-sm">YouTube</span>
                    </div>
                    <span className="text-sm font-medium">{stats.subscribers.youtube.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <PlatformIcon platform="facebook" size={16} />
                      <span className="text-sm">Facebook</span>
                    </div>
                    <span className="text-sm font-medium">{stats.subscribers.facebook.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <h3 className="text-sm font-medium mb-2">Subscriber Revenue</h3>
                <div className="text-2xl font-bold">$3,890</div>
                <p className="text-xs text-green-500">+$420 this month</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <h3 className="text-sm font-medium mb-2">Tier Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tier 1</span>
                    <span className="text-sm font-medium">68%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tier 2</span>
                    <span className="text-sm font-medium">24%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tier 3</span>
                    <span className="text-sm font-medium">8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle>Subscribers List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border">
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Platform</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Tier</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Subscribed Date</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubscribers.map((subscriber, index) => (
                        <tr key={subscriber.id || index} className="border-t border-border">
                          <td className="p-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                                {subscriber.subscriberDisplayName?.charAt(0) || subscriber.subscriberUsername.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium flex items-center">
                                  {subscriber.subscriberDisplayName || subscriber.subscriberUsername}
                                  {subscriber.isGift && (
                                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-500">
                                      Gift
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">@{subscriber.subscriberUsername}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-1">
                              <PlatformIcon platform={subscriber.platform} />
                              <span>{subscriber.platform.charAt(0).toUpperCase() + subscriber.platform.slice(1)}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs inline-flex items-center">
                              <Crown size={12} className="mr-1" />
                              Tier {subscriber.tier}
                            </div>
                          </td>
                          <td className="p-3">{formatDate(subscriber.subscribedAt)}</td>
                          <td className="p-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="flex items-center">
                                  <Tag className="mr-2 h-4 w-4" />
                                  <span>Add Tag</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center">
                                  <Mail className="mr-2 h-4 w-4" />
                                  <span>Send Message</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center text-red-500">
                                  <Users className="mr-2 h-4 w-4" />
                                  <span>Remove</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{filteredSubscribers.length}</span> of{" "}
                  <span className="font-medium">{subscribersToDisplay.length}</span> results
                </p>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}

export default FollowersPage

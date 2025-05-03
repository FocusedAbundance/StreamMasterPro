import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import type { ScheduledStream } from "@shared/schema"
import { MoreHorizontal } from "lucide-react"
import { format } from "date-fns"

const UpcomingStreams: React.FC = () => {
  const { data: streams, isLoading } = useQuery<ScheduledStream[]>({
    queryKey: ["/api/users/1/scheduled-streams"], // Using static user ID for demo
  })

  // Default streams to display if API fetch hasn't completed
  const defaultStreams = [
    {
      id: 1,
      title: "Minecraft Build Challenge",
      description: "Building epic structures with viewers",
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000), // 3 days from now, 7PM
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 22 * 60 * 60 * 1000), // 3 days from now, 10PM
      platforms: ["twitch", "youtube"],
    },
    {
      id: 2,
      title: "Fortnite with Subscribers",
      description: "Playing with subscribers and viewers",
      startTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000), // 6 days from now, 8PM
      endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000), // 6 days from now, 11PM
      platforms: ["twitch", "youtube", "facebook"],
    },
    {
      id: 3,
      title: "Special Q&A Session",
      description: "Answering viewer questions",
      startTime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000), // 9 days from now, 6PM
      endTime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000), // 9 days from now, 8PM
      platforms: ["twitch"],
    },
  ]

  const streamsToDisplay = streams || defaultStreams

  const formatTime = (date: Date) => {
    return format(date, "h:mm a")
  }

  const getMonthAbbreviation = (date: Date) => {
    return format(date, "MMM").toUpperCase()
  }

  const getDayOfMonth = (date: Date) => {
    return format(date, "d")
  }

  return (
    <Card className="border-border overflow-hidden">
      <CardHeader className="p-4 border-b border-border flex justify-between items-center">
        <CardTitle className="font-medium text-foreground">Upcoming Streams</CardTitle>
        <button className="text-xs text-primary hover:underline">Schedule New</button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {streamsToDisplay.map((stream) => (
            <div key={stream.id} className="p-4 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-md bg-muted flex flex-col items-center justify-center text-foreground">
                <span className="text-xs">{getMonthAbbreviation(new Date(stream.startTime))}</span>
                <span className="text-lg font-semibold">{getDayOfMonth(new Date(stream.startTime))}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{stream.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatTime(new Date(stream.startTime))} - {formatTime(new Date(stream.endTime))}
                </p>
              </div>
              <div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal size={18} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default UpcomingStreams

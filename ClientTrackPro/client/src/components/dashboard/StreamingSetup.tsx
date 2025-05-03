import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Settings, LayoutGrid, Drill, Plus } from "lucide-react"

const StreamingSetup: React.FC = () => {
  return (
    <Card className="border-border overflow-hidden mt-6">
      <CardHeader className="p-4 border-b border-border">
        <CardTitle className="font-medium">Streaming Setup</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative group overflow-hidden rounded-lg">
            <AspectRatio ratio={16 / 9}>
              <div
                className="w-full h-full bg-cover bg-center bg-muted"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80)",
                }}
              ></div>
            </AspectRatio>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <p className="text-white text-sm font-medium">Main Camera</p>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-lg">
            <AspectRatio ratio={16 / 9}>
              <div
                className="w-full h-full bg-cover bg-center bg-muted"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-1599153270318-2833cf190495?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80)",
                }}
              ></div>
            </AspectRatio>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <p className="text-white text-sm font-medium">Keyboard Cam</p>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-lg">
            <AspectRatio ratio={16 / 9}>
              <div
                className="w-full h-full bg-cover bg-center bg-muted"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-1586182987320-4f17e36a0fbc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80)",
                }}
              ></div>
            </AspectRatio>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <p className="text-white text-sm font-medium">Room Cam</p>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-lg bg-muted flex items-center justify-center">
            <AspectRatio ratio={16 / 9}>
              <div className="w-full h-full flex items-center justify-center">
                <Plus size={24} className="text-muted-foreground" />
              </div>
            </AspectRatio>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <p className="text-white text-sm font-medium">Add Camera</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings size={16} />
            <span>Configure Scene</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <LayoutGrid size={16} />
            <span>Switch Layout</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Drill size={16} />
            <span>Advanced Settings</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default StreamingSetup

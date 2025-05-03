import type React from "react"
import { useLocation, Link } from "wouter"
import {
  LayoutDashboard,
  MessageSquare,
  Bell,
  Gift,
  Bot,
  BarChart2,
  Database,
  Flag,
  Wand2,
  User,
  Settings,
} from "lucide-react"

const Sidebar: React.FC = () => {
  const [location] = useLocation()

  const isActive = (path: string) => {
    return location === path
  }

  const navItems = [
    { path: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { path: "/multi-chat", icon: <MessageSquare size={20} />, label: "Multi-Chat" },
    { path: "/alerts", icon: <Bell size={20} />, label: "Alerts" },
    { path: "/giveaways", icon: <Gift size={20} />, label: "Giveaways" },
    { path: "/chatbots", icon: <Bot size={20} />, label: "Chat Bots" },
    { path: "/statistics", icon: <BarChart2 size={20} />, label: "Statistics" },
    { path: "/followers", icon: <Database size={20} />, label: "Followers DB" },
    { path: "/goals", icon: <Flag size={20} />, label: "Goals" },
    { path: "/automations", icon: <Wand2 size={20} />, label: "Automations" },
    { path: "/accounts", icon: <Settings size={20} />, label: "Accounts" },
  ]

  return (
    <div className="w-16 md:w-64 bg-card border-r border-border flex flex-col dark">
      <div className="p-4 flex items-center justify-center md:justify-start space-x-3 border-b border-border">
        <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
          <span className="text-xl font-semibold">S</span>
        </div>
        <h1 className="text-xl font-bold text-foreground hidden md:block">StreamMaster</h1>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <div
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md cursor-pointer ${
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent transition-colors"
                  }`}
                >
                  {item.icon}
                  <span className="hidden md:inline-block">{item.label}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User size={16} className="text-muted-foreground" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground">GamerPro123</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

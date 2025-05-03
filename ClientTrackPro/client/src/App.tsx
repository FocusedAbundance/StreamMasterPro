import { Switch, Route } from "wouter"
import { queryClient } from "./lib/queryClient"
import { QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import NotFound from "@/pages/not-found"
import Dashboard from "@/pages/dashboard"
import MultiChatPage from "@/pages/multi-chat"
import AlertsPage from "@/pages/alerts"
import GiveawaysPage from "@/pages/giveaways"
import ChatbotsPage from "@/pages/chatbots"
import StatisticsPage from "@/pages/statistics"
import FollowersPage from "@/pages/followers"
import GoalsPage from "@/pages/goals"
import AutomationsPage from "@/pages/automations"
import AccountsPage from "@/pages/accounts"

function Router() {
  return (
    <Switch>
      {/* Main routes */}
      <Route path="/" component={Dashboard} />
      <Route path="/multi-chat" component={MultiChatPage} />
      <Route path="/alerts" component={AlertsPage} />
      <Route path="/giveaways" component={GiveawaysPage} />
      <Route path="/chatbots" component={ChatbotsPage} />
      <Route path="/statistics" component={StatisticsPage} />
      <Route path="/followers" component={FollowersPage} />
      <Route path="/goals" component={GoalsPage} />
      <Route path="/automations" component={AutomationsPage} />
      <Route path="/accounts" component={AccountsPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App

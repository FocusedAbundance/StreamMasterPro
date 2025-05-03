import type React from "react"
import type { PropsWithChildren } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"

interface DashboardLayoutProps {
  title: string
  subtitle?: string
}

const DashboardLayout: React.FC<PropsWithChildren<DashboardLayoutProps>> = ({ children, title, subtitle }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-dark">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} subtitle={subtitle} />

        <main className="flex-1 overflow-y-auto p-6 bg-background scrollbar-thin">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout

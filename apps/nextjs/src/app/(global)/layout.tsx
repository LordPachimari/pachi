import { MainNav } from "~/components/layouts/main-nav/main-nav"
import MainSidebar from "~/components/templates/sidebars/main-sidebar"
import { ScrollArea } from "~/components/ui/scroll-area"
import { GlobalReplicacheProvider } from "~/providers/replicache/global"

interface HomeLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: HomeLayoutProps) {
  const username = "pachimari"
  return (
    <GlobalReplicacheProvider>
      <div className="relative flex min-h-screen flex-col">
        <MainNav />
        <div className="flex">
          <MainSidebar username={username} />

          <main className="z-0 max-h-screen flex-1 bg-navbar">
            <ScrollArea className="h-content z-10 w-full border bg-background  shadow-inner md:rounded-tl-2xl">
              {children}
            </ScrollArea>
          </main>
        </div>
      </div>
    </GlobalReplicacheProvider>
  )
}

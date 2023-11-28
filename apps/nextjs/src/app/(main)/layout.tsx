import { ScrollArea } from "~/components/atoms/scroll-area";
import GlobalRep from "~/components/other/replicache/global-rep";
import { MainNav } from "~/components/templates/layouts/main-nav/main-nav";
import MainSidebar from "~/components/templates/sidebars/main-sidebar";
import { getUsername, userId } from "../_actions/user-id";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export default async function MainLayout({ children }: HomeLayoutProps) {
  const user_id = await userId();
  console.log("GLOBAL_USER_ID", user_id);
  const username = await getUsername(user_id);
  return (
    <div className="relative flex min-h-screen flex-col">
      <MainNav />
      <div className="flex">
        <MainSidebar username={username} />

        <main className="z-0 max-h-screen flex-1 bg-navbar">
          <ScrollArea className="z-10 h-content w-full border bg-background  shadow-inner md:rounded-tl-2xl">
            {children}
          </ScrollArea>
        </main>
        {/* <GlobalRep userId={user_id} /> */}
      </div>
    </div>
  );
}

import { getUserId } from "~/app/_actions/user-id";
import DashboardRep from "~/components/other/replicache/dashboard-rep";
import DashboardSidebar from "~/components/templates/sidebars/dashboard-sidebar";
import { dashboardConfig } from "~/config/dashboard";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // const userId = await getUserId();
  const userId = "user1";
  // const socket = useRef(
  //   new PartySocket({
  //     host: `http://127.0.0.1:1999/parties/push`, // for local development
  //     // host: "my-party.username.partykit.dev", // for production
  //     space: `dashboard:${userId}`,
  //   }),
  // );
  // useEffect(() => {
  //   if (socket.current) {
  //     socket.current.addEventListener("message", (evt) => {
  //       console.log("received data from websocket dashboard", evt.data); // "hello from space: my-space"
  //     });
  //   }
  //   return () => {
  //     if (socket.current) {
  //       socket.current.removeEventListener("message", (evt) => {});
  //     }
  //   };
  // }, []);

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar
        items={dashboardConfig.sidebarNav}
        storeId="pachimari"
      />
      <main className="ml-14 w-full">{children}</main>
      <DashboardRep userId={userId} />
    </div>
  );
}

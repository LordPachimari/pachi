import { DashboardButton } from "../../layouts/main-nav/dashboard-button";
import { ThemeToggle } from "../../layouts/theme-toggle";

interface MainSidebarProps {
  username: string | undefined;
}
export default function MainSidebar({ username }: MainSidebarProps) {
  return (
    <div className="sticky hidden w-18  flex-col  items-center  bg-navbar pt-10 md:flex ">
      <DashboardButton username={username} />
      <ThemeToggle />
    </div>
  );
}

import { DashboardButton } from "../../layouts/main-nav/dashboard-button";
import { ThemeToggle } from "../../layouts/theme-toggle";

interface MainSidebarProps {
  username: string | undefined;
}

export default function MainSidebar({ username }: MainSidebarProps) {
  return (
    <div className="w-18 sticky hidden  flex-col  items-center  bg-navbar pt-10 md:flex ">
      <DashboardButton username={username} />
      <ThemeToggle />
    </div>
  );
}

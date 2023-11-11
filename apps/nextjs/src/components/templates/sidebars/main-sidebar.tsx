import { ThemeToggle } from "../layouts/theme-toggle";

export default function MainSidebar() {
  return (
    <div className="sticky hidden w-14  flex-col bg-white dark:bg-black md:flex ">
      <ThemeToggle />
    </div>
  );
}

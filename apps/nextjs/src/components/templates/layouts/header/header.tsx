import { Logo } from "~/components/molecules/logo";
import { validateRequest } from "~/libs/validate-request";
import { Navbar } from "../navbar";
import { ThemeToggle } from "../theme-toggle";
import { DashboardButton } from "./dashboard-button";

async function Header() {
  const { user } = await validateRequest();

  return (
    <Navbar>
      {/* Left corner */}
      {/* <MobileNavMenu /> */}
      <div></div>

      <Logo className="absolute left-1/2 flex -translate-x-1/2" />

      {/* Right corner */}
      <div className="hidden gap-6 sm:flex ">
        <ThemeToggle />
        {/* <CartToggle /> */}
        <DashboardButton user={user} />
      </div>
    </Navbar>
  );
}

export { Header };

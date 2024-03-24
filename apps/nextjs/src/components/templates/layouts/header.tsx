import { Logo } from "~/components/molecules/logo";
import { Button } from "~/components/ui/button";
import { Navbar } from "./navbar";
import { ThemeToggle } from "./theme-toggle";

async function Header() {
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
        <Button>Dashboard</Button>
      </div>
    </Navbar>
  );
}

export { Header };

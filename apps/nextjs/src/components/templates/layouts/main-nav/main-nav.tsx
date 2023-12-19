import { MainNavContent } from "~/components/templates/layouts/main-nav-content";
import { MobileMainNav } from "~/components/templates/layouts/mobile-main-nav";
import { dashboardConfig } from "~/config/dashboard";
import { siteConfig } from "~/config/site";
import { DashboardButton } from "./dashboard-button";

// interface SiteHeaderProps {
//   // user: User | null;
// }

interface MainNavProps {
  username: string | undefined;
}
export function MainNav({ username }: MainNavProps) {
  // const initials = `${user?.firstName?.charAt(0) ?? ""} ${
  //   user?.lastName?.charAt(0) ?? ""
  // }`;
  // const email =
  //   user?.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)
  //     ?.emailAddress ?? "";

  console.log("username", username);
  return (
    <header className="sticky top-0 z-50 flex h-[56px] w-full items-center  bg-component  ">
      <div className="container flex h-16 items-center">
        <MainNavContent items={siteConfig.mainNav} />

        <MobileMainNav
          mainNavItems={siteConfig.mainNav}
          sidebarNavItems={dashboardConfig.sidebarNav}
        />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <DashboardButton username={username} />
            {/* <Combobox /> */}
            {/* <CartSheet /> */}
            {/* {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.imageUrl}
                        alt={user.username ?? ""}
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/account">
                        <Icons.user
                          className="mr-2 h-4 w-4"
                          aria-hidden="true"
                        />
                        Account
                        <DropdownMenuShortcut>⇧⌘A</DropdownMenuShortcut>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/stores">
                        <Icons.terminal
                          className="mr-2 h-4 w-4"
                          aria-hidden="true"
                        />
                        Dashboard
                        <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild disabled>
                      <Link href="/dashboard/settings">
                        <Icons.settings
                          className="mr-2 h-4 w-4"
                          aria-hidden="true"
                        />
                        Settings
                        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/signout">
                      <Icons.logout
                        className="mr-2 h-4 w-4"
                        aria-hidden="true"
                      />
                      Log out
                      <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/dashboard/products">
                  <div
                    className={buttonVariants({
                      size: "sm",
                    })}
                  >
                    <Flame className="mr-1 text-white" size={15} />
                    Dashboard
                    <span className="sr-only">Dashboard</span>
                  </div>
                </Link>

                <Link href="/signin" className="hidden md:block">
                  <div
                    className={buttonVariants({
                      size: "sm",
                    })}
                  >
                    Sign In
                    <span className="sr-only">Sign In</span>
                  </div>
                </Link>
              </>
            )} */}
          </nav>
        </div>
      </div>
    </header>
  );
}

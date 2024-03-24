import Link from "next/link";

type LogoProps = Omit<React.ComponentProps<typeof Link>, "href">;

function Logo({ className = "", ...props }: LogoProps) {
  return (
    <Link
      {...props}
      className={`${className} block text-center text-2xl font-extrabold transition-all`}
      href="/"
    >
      Pachi<span className="sr-only">Logo</span>
    </Link>
  );
}

export { Logo };

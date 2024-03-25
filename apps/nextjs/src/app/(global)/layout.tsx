import dynamic from "next/dynamic";

import { Header } from "~/components/templates/layouts/header/header";

const GlobalReplicacheProvider = dynamic(
  () => import("~/providers/replicache/global"),
  { ssr: false },
);

interface HomeLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: HomeLayoutProps) {
  return (
    // <GlobalReplicacheProvider>
    <>
      <Header />
      {children}
    </>
    // </GlobalReplicacheProvider>
  );
}

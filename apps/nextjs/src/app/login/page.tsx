import dynamic from "next/dynamic";

const HankoAuth = dynamic(() => import("~/components/other/auth/Hanko"), {
  ssr: false,
});
export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-content flex-col items-center justify-center ">
      <HankoAuth />
    </div>
  );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function Redirect() {
  const accountExist = cookies().get("accountExist")?.value;
  if (!accountExist) return redirect("/username");
  else return redirect("/home");
}

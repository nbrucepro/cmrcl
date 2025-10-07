import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const token = (await cookies()).get("adminToken")?.value;

  if (!token) {
    redirect("/adminlogin");
  }else{
    redirect("/inv/dashboard");
  }
}

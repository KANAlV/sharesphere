import { redirect } from "next/navigation";
export default async function redir() {
    redirect("/settings/account");
}
import { redirect } from "next/navigation";

/**
 * There is no separate admin panel: the site is edited where it stands. A
 * signed-in admin who comes here is sent to the home page, where the edit bar
 * is; the proxy has already sent anyone else to the sign-in page.
 */
export default function AdminPage() {
  redirect("/");
}

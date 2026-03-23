import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StickyNavbar } from "@/components/ui/sticky-navbar";
import SettingsClient from "./SettingsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Fluxora",
  description: "Manage your account settings and profile preferences.",
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-black">
      <StickyNavbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <SettingsClient session={session} />
      </div>
    </div>
  );
}

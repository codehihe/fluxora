import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import WorkflowGrid from "@/components/workflow/WorkflowGrid";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, CreditCard, ExternalLink, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { StickyNavbar } from "@/components/ui/sticky-navbar";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if ((session.user as any).role === "ADMIN" || (session.user as any).role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  const savedWorkflows = await prisma.savedWorkflow.findMany({
    where: {
      userId: (session.user as any).id,
    },
    include: {
      workflow: {
        include: {
          categories: {
            include: { category: true },
          },
          tags: {
            include: { tag: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Transform for grid
  const workflows = savedWorkflows.map((sw: any) => ({
    ...sw.workflow,
    categories: sw.workflow.categories.map((c: any) => ({ category: c.category })),
    tags: sw.workflow.tags.map((t: any) => ({ tag: t.tag })),
  }));

  const purchases = await prisma.purchase.findMany({
    where: {
      userId: (session.user as any).id,
    },
    include: {
      workflow: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-black">
      <StickyNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-mono">My Saved Workflows</h1>
              <p className="text-muted-foreground font-mono">
                Manage your collection of automation templates
              </p>
            </div>
          </div>

          {workflows.length > 0 ? (
            <WorkflowGrid workflows={workflows as any} />
          ) : (
            <Card className="border-dashed border-2 bg-transparent">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Heart className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-bold font-mono mb-2">No saved workflows yet</h3>
                <p className="text-muted-foreground font-mono max-w-sm">
                  Browse the library and click the heart icon to save workflows for later.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Purchased Workflows Section */}
        <div className="space-y-8 mt-16">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[#FF6B35]/10 flex items-center justify-center border border-[#FF6B35]/20">
              <CreditCard className="h-6 w-6 text-[#FF6B35]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-mono">My Purchases</h1>
              <p className="text-muted-foreground font-mono">
                Premium workflows you have unlocked
              </p>
            </div>
          </div>

          {purchases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchases.map((purchase: any) => (
                <Card key={purchase.id} className="border-2 border-[#FF6B35]/20 hover:border-[#FF6B35]/50 transition-colors flex flex-col justify-between">
                  <div>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          {purchase.workflow.icon && <span className="text-2xl">{purchase.workflow.icon}</span>}
                          <h3 className="font-bold text-lg font-mono line-clamp-1">{purchase.workflow.name}</h3>
                        </div>
                        <Badge variant="outline" className="bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20 font-mono">
                          {purchase.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground font-mono">
                        <div className="flex justify-between">
                          <span>Price Paid:</span>
                          <span className="font-bold text-foreground">₹{purchase.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Date:</span>
                          <span>{new Date(purchase.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Order ID:</span>
                          <span className="text-xs trunk">{purchase.orderId}</span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                  <div className="p-4 bg-muted/30 border-t flex gap-3">
                    <Link href={`/workflows/${purchase.workflow.slug}`} className="flex-1">
                      <button className="w-full h-9 flex items-center justify-center rounded-md border text-sm font-medium transition-colors hover:bg-muted font-mono">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </button>
                    </Link>
                    <Link href={`/workflows/${purchase.workflow.slug}?action=download`} className="flex-1">
                      <button className="w-full h-9 flex items-center justify-center rounded-md bg-[#FF6B35] text-white text-sm font-medium transition-colors hover:bg-[#FF6B35]/90 font-mono">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 bg-transparent">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <CreditCard className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-bold font-mono mb-2">No purchases yet</h3>
                <p className="text-muted-foreground font-mono max-w-sm">
                  Premium workflows you buy will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

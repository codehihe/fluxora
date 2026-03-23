import { prisma } from "@/lib/prisma"
import CouponsClient from "./CouponsClient"

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" }
  })

  // We need to parse dates so they serialize nicely to client
  const safeCoupons = coupons.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    validUntil: c.validUntil ? c.validUntil.toISOString() : null,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Coupons & Discounts</h1>
        <p className="text-white mt-1">Manage discount codes for premium workflows</p>
      </div>

      <CouponsClient initialCoupons={safeCoupons} />
    </div>
  )
}

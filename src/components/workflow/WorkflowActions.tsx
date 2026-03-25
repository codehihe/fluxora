"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */


import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Download, Lock } from "lucide-react"
import { toast } from "sonner"
import { copyWorkflowJSON, downloadWorkflowJSON } from "@/lib/utils"

interface WorkflowActionsProps {
  workflowJson: any
  workflowSlug: string
  workflowId: string
  isPaid?: boolean
  price?: number
  isLocked?: boolean
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function WorkflowActions({ workflowJson, workflowSlug, workflowId, isPaid, price, isLocked }: WorkflowActionsProps) {
  const [isCopying, setIsCopying] = useState(false)
  const [isBuying, setIsBuying] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [discountData, setDiscountData] = useState<{ discountPercentage: number; finalPrice: number; discountAmount?: number; originalPrice?: number } | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/payments/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, workflowId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid coupon");
      }
      setDiscountData({ 
        discountPercentage: data.discountPercentage, 
        finalPrice: data.finalPrice,
        discountAmount: data.discountAmount,
        originalPrice: data.originalPrice
      });
      toast.success("Coupon applied successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to apply coupon");
      setDiscountData(null);
    } finally {
      setCouponLoading(false);
    }
  }

  const handleCopy = async () => {
    setIsCopying(true)
    try {
      await copyWorkflowJSON(workflowJson)
      toast.success("Workflow JSON copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy JSON")
    } finally {
      setIsCopying(false)
    }
  }

  const handleDownload = async () => {
    try {
      // Track download
      await fetch(`/api/download/${workflowId}`, { method: "POST" })

      // Download file
      downloadWorkflowJSON(workflowJson, workflowSlug)
      toast.success("Workflow JSON downloaded!")
    } catch (error) {
      toast.error("Failed to download JSON")
    }
  }

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleBuy = async () => {
    setIsBuying(true)
    try {
      const resLoad = await loadRazorpay()
      if (!resLoad) {
        toast.error("Razorpay SDK failed to load. Are you online?")
        return
      }

      const resOrder = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId, couponCode: discountData ? couponCode : undefined }),
      })

      if (!resOrder.ok) {
        const err = await resOrder.json()
        throw new Error(err.error || "Failed to create order")
      }

      const orderData = await resOrder.json()

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Fluxora",
        description: orderData.discountAmount > 0 
          ? `Premium Workflow (${orderData.appliedDiscountPercentage}% off - Saved ₹${orderData.discountAmount})` 
          : "Premium Workflow Purchase",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                workflowId,
              }),
            })

            if (verifyRes.ok) {
              toast.success("Payment successful! Unlocking workflow...")
              window.location.reload()
            } else {
              toast.error("Payment verification failed. Please contact support.")
            }
          } catch (e) {
            toast.error("An error occurred during verification.")
          }
        },
        theme: {
          color: "#FF6B35",
        },
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to initiate payment")
    } finally {
      setIsBuying(false)
    }
  }

  if (isLocked) {
    return (
      <div className="flex flex-col gap-4 max-w-sm">
        <div className="flex gap-2">
          <Input 
            placeholder="Coupon Code" 
            value={couponCode} 
            onChange={(e) => setCouponCode(e.target.value)} 
          />
          <Button variant="outline" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode}>
             {couponLoading ? "..." : "Apply"}
          </Button>
        </div>
        {discountData && (
          <p className="text-sm text-green-500 font-medium">
            Coupon applied! You saved ₹{discountData.discountAmount} ({discountData.discountPercentage}% off).
          </p>
        )}
        <Button size="lg" onClick={handleBuy} disabled={isBuying} className="w-full gap-2 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white shadow-xl hover:-translate-y-1 transition-all">
          <Lock className="h-4 w-4" />
          {isBuying ? "Processing..." : (
            <span className="flex items-center gap-2">
              Buy Now for ₹{discountData ? discountData.finalPrice : price}
              {discountData && discountData.originalPrice && (
                <span className="line-through text-white/70 text-sm">
                  ₹{discountData.originalPrice}
                </span>
              )}
            </span>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-4">
      <Button size="lg" onClick={handleCopy} disabled={isCopying} className="gap-2">
        <Copy className="h-4 w-4" />
        {isCopying ? "Copying..." : "Copy JSON"}
      </Button>
      <Button size="lg" variant="outline" onClick={handleDownload} className="gap-2">
        <Download className="h-4 w-4" />
        Download JSON
      </Button>
    </div>
  )
}

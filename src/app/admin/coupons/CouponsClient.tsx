"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */


import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trash, Edit, Plus } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type Coupon = {
  id: string
  code: string
  discountPercentage: number
  isActive: boolean
  maxUses: number | null
  usedCount: number
  validUntil: string | null
}

export default function CouponsClient({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    code: "",
    discountPercentage: "",
    maxUses: "",
    validUntil: "",
    isActive: true,
  })
  const router = useRouter()

  const openAddModal = () => {
    setEditingId(null)
    setFormData({ code: "", discountPercentage: "", maxUses: "", validUntil: "", isActive: true })
    setIsOpen(true)
  }

  const openEditModal = (coupon: Coupon) => {
    setEditingId(coupon.id)
    setFormData({
      code: coupon.code,
      discountPercentage: coupon.discountPercentage.toString(),
      maxUses: coupon.maxUses ? coupon.maxUses.toString() : "",
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : "",
      isActive: coupon.isActive,
    })
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete coupon")
      setCoupons(c => c.filter(x => x.id !== id))
      toast.success("Coupon deleted")
      router.refresh()
    } catch {
      toast.error("Failed to delete coupon")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons"
      const method = editingId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
         const err = await res.text()
         throw new Error(err || "Failed to save coupon")
      }

      const saved = await res.json()
      
      if (editingId) {
        setCoupons(c => c.map(x => x.id === editingId ? saved : x))
      } else {
        setCoupons(c => [saved, ...c])
      }

      toast.success("Coupon saved successfully")
      setIsOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to save coupon")
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>All Coupons</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddModal} className="gap-2">
              <Plus className="h-4 w-4" /> Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Coupon" : "Add New Coupon"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code</Label>
                <Input 
                  id="code" 
                  required 
                  value={formData.code} 
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SUMMER20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discountPercentage">Discount Percentage (%)</Label>
                <Input 
                  id="discountPercentage" 
                  type="number" 
                  required 
                  min="1" 
                  max="100"
                  value={formData.discountPercentage} 
                  onChange={e => setFormData({ ...formData, discountPercentage: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUses">Max Uses (Optional)</Label>
                <Input 
                  id="maxUses" 
                  type="number" 
                  placeholder="Unlimited"
                  value={formData.maxUses} 
                  onChange={e => setFormData({ ...formData, maxUses: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until (Optional)</Label>
                <Input 
                  id="validUntil" 
                  type="date" 
                  value={formData.validUntil} 
                  onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <Button type="submit" className="w-full">Save Coupon</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-gray-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                    No coupons found
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-medium">{coupon.code}</TableCell>
                    <TableCell>{coupon.discountPercentage}%</TableCell>
                    <TableCell>
                      {coupon.isActive ? (
                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {coupon.usedCount} / {coupon.maxUses ? coupon.maxUses : "∞"}
                    </TableCell>
                    <TableCell>
                      {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(coupon)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(coupon.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

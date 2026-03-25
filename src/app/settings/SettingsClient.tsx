"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */


import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { 
  User, 
  Settings, 
  Shield, 
  Globe, 
  Github, 
  Twitter, 
  Linkedin,
  MapPin,
  Link as LinkIcon,
  Loader2
} from "lucide-react"

export default function SettingsClient({ session: initialSession }: { session: any }) {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/user/settings")
        const data = await res.json()
        if (data.success) {
          setUser(data.user)
        } else {
          toast.error(data.error || "Failed to load settings")
        }
      } catch (error) {
        toast.error("An error occurred while fetching settings")
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      })

      const data = await res.json()

      if (data.success) {
        toast.success("Settings updated successfully")
        // Update session if name or image changed
        await update({
          ...session,
          user: {
            ...session?.user,
            name: user.name,
            image: user.image,
          }
        })
      } else {
        toast.error(data.error || "Failed to update settings")
      }
    } catch (error) {
      toast.error("An error occurred while updating settings")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setUser((prev: any) => ({ ...prev, [id]: value }))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-mono">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold font-mono tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground font-mono">
          Manage your profile, account preferences, and presence on Fluxora.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 border border-border/50">
          <TabsTrigger value="profile" className="gap-2 font-mono">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2 font-mono">
            <Shield className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2 font-mono">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleUpdate}>
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-black/40 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-mono text-xl">Public Profile</CardTitle>
                <CardDescription className="font-mono">
                  This information will be displayed on your public profile page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-mono">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="Your Name" 
                      value={user?.name || ""} 
                      onChange={handleChange}
                      className="bg-black/50 border-white/10 focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="font-mono">Username</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">@</span>
                      <Input 
                        id="username" 
                        placeholder="username" 
                        value={user?.username || ""} 
                        onChange={handleChange}
                        className="pl-8 bg-black/50 border-white/10 focus:border-primary/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="font-mono">Bio</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Tell us about yourself..." 
                    value={user?.bio || ""} 
                    onChange={handleChange}
                    rows={4}
                    className="bg-black/50 border-white/10 focus:border-primary/50 resize-none"
                  />
                  <p className="text-[10px] text-muted-foreground font-mono italic">
                    Supports markdown formatting. Brief introduction for your profile.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="font-mono">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="location" 
                        placeholder="City, Country" 
                        value={user?.location || ""} 
                        onChange={handleChange}
                        className="pl-10 bg-black/50 border-white/10 focus:border-primary/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl" className="font-mono">Website</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="websiteUrl" 
                        placeholder="https://example.com" 
                        value={user?.websiteUrl || ""} 
                        onChange={handleChange}
                        className="pl-10 bg-black/50 border-white/10 focus:border-primary/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-muted-foreground">Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="twitterHandle" className="font-mono flex items-center gap-2">
                        <Twitter className="h-3.5 w-3.5" />
                        Twitter
                      </Label>
                      <Input 
                        id="twitterHandle" 
                        placeholder="handle" 
                        value={user?.twitterHandle || ""} 
                        onChange={handleChange}
                        className="bg-black/50 border-white/10 focus:border-primary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="githubUrl" className="font-mono flex items-center gap-2">
                        <Github className="h-3.5 w-3.5" />
                        GitHub URL
                      </Label>
                      <Input 
                        id="githubUrl" 
                        placeholder="https://github.com/..." 
                        value={user?.githubUrl || ""} 
                        onChange={handleChange}
                        className="bg-black/50 border-white/10 focus:border-primary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedinUrl" className="font-mono flex items-center gap-2">
                        <Linkedin className="h-3.5 w-3.5" />
                        LinkedIn URL
                      </Label>
                      <Input 
                        id="linkedinUrl" 
                        placeholder="https://linkedin.com/in/..." 
                        value={user?.linkedinUrl || ""} 
                        onChange={handleChange}
                        className="bg-black/50 border-white/10 focus:border-primary/50"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t border-border/50 px-6 py-4 flex justify-between">
                <p className="text-sm text-muted-foreground font-mono">
                  Last updated: {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Never"}
                </p>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all hover:scale-105"
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card className="bg-black/40 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-mono text-xl text-destructive/80 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Authentication
                </CardTitle>
                <CardDescription className="font-mono">
                  Manage your account's primary identification and security layers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="font-mono">Email Address</Label>
                  <Input 
                    disabled 
                    value={user?.email || ""} 
                    className="bg-muted/30 border-white/5 font-mono text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-[10px] text-muted-foreground font-mono">
                    Email cannot be changed currently. Contact support if required.
                  </p>
                </div>
                
                <div className="pt-6 border-t border-white/5 space-y-4">
                  <h3 className="text-sm font-bold font-mono">Authentication Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center gap-4">
                      <div className={`h-3 w-3 rounded-full ${user?.emailVerified ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]'}`} />
                      <div>
                        <p className="text-sm font-bold font-mono">Email Verification</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {user?.emailVerified ? "Verified" : "Verification Pending"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
             <Card className="bg-black/40 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-mono text-xl flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Fluxora Experience
                </CardTitle>
                <CardDescription className="font-mono">
                  Personalize how you interact with the platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                 <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                 <h3 className="font-mono font-bold mb-2">Coming Soon</h3>
                 <p className="text-sm text-muted-foreground font-mono max-w-xs">
                   Advanced UI preferences, notification controls, and workspace customization are in active development.
                 </p>
              </CardContent>
            </Card>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  )
}

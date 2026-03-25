"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Home, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Boundary caught:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden font-mono">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'url(/grid.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '112px 112px',
        }}
      />
      
      <div className="relative z-10 text-center space-y-8 p-12 max-w-xl border-2 border-primary/20 bg-background/50 backdrop-blur-xl">
        <div className="flex justify-center">
          <div className="rounded-none bg-primary/10 p-6 border-2 border-primary/50 animate-pulse">
            <AlertCircle className="h-16 w-16 text-primary" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-4xl font-bold tracking-tighter uppercase italic">
            SYSTEM_ERROR::<span className="text-primary italic">0x001</span>
          </h2>
          <p className="text-muted-foreground text-sm uppercase tracking-widest leading-relaxed">
            A CRITICAL EXCEPTION HAS OCCURRED IN THE RENDER PIPELINE. 
            THE CURRENT STATE HAS BEEN PRESERVED FOR RECOVERY.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <Button 
            onClick={reset} 
            variant="default" 
            size="lg"
            className="rounded-none bg-primary hover:bg-primary/90 text-white font-bold tracking-widest"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            REBOOT_STATE
          </Button>
          <Button 
            onClick={() => (window.location.href = "/")} 
            variant="outline" 
            size="lg"
            className="rounded-none border-2 border-primary/20 hover:border-primary/50 font-bold tracking-widest uppercase"
          >
            <Home className="mr-2 h-5 w-5" />
            RETURN_HOME
          </Button>
        </div>

        <div className="pt-8 border-t border-white/5 opacity-50">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
            Fluxora v0.1.0 // Production Environment
            {error.digest && <span className="block mt-1">Fault ID: {error.digest}</span>}
          </p>
        </div>
      </div>
    </div>
  )
}

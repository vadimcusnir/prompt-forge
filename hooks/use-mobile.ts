import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Initialize with undefined to prevent hydration mismatch
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    // Mark as client-side to prevent hydration issues
    setIsClient(true)
    
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Return false during SSR to prevent hydration mismatch
  if (!isClient) return false
  
  return !!isMobile
}

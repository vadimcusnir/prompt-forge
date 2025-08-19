'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'

// Dynamic import pentru BackgroundRoot
const BackgroundRoot = dynamic(() => import('@/components/bg/BackgroundRoot'), { 
  ssr: false,
  loading: () => null
})

export default function ComingSoonPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubmitted(true)
      // TODO: Implement actual email submission
      console.log('Email submitted:', email)
    }
  }

  return (
    <>
      {/* BackgroundRoot cu configurarea pentru /coming-soon */}
      <BackgroundRoot 
        profile="ambient_minimal" 
        routeKey="/coming-soon"
        enableMatrix={true}
        enableQuotes={false} // Quotes off pentru /coming-soon
        enableFigures={true}
        enableMicroUI={true}
      />
      
      {/* Main content cu z-index corect */}
      <main className="relative z-10 min-h-screen bg-background">
        {/* Hero Section - Mobile First */}
        <section className="pf-hero container max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Hero Badge */}
            <Badge variant="secondary" className="mb-4 sm:mb-6 text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2">
              🚀 Coming Soon - Join the Revolution
            </Badge>

            {/* Hero Title - Responsive Typography */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-heading font-bold text-foreground mb-4 sm:mb-6 lg:mb-8 leading-tight">
              PROMPTFORGE™
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 lg:mb-10 max-w-3xl mx-auto leading-relaxed">
              The ultimate prompt engineering platform. Build, test, and deploy AI prompts at scale.
            </p>

            {/* CTA Section */}
            {!isSubmitted ? (
              <Card className="p-6 sm:p-8 max-w-md mx-auto bg-card/50 backdrop-blur-sm border-border/50">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">Get Early Access</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    Join Waitlist
                  </Button>
                </form>
              </Card>
            ) : (
              <Card className="p-6 sm:p-8 max-w-md mx-auto bg-card/50 backdrop-blur-sm border-border/50">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2">You're on the list!</h2>
                  <p className="text-muted-foreground">We'll notify you when PROMPTFORGE™ launches.</p>
                </div>
              </Card>
            )}
          </div>
        </section>

        {/* Features Preview */}
        <section className="container max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
              What's Coming
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the powerful features that will revolutionize your AI workflow
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: "AI Module Library",
                description: "50+ specialized modules for every domain and use case",
                icon: "🧠"
              },
              {
                title: "Prompt Testing",
                description: "Built-in testing engine with real AI model validation",
                icon: "🧪"
              },
              {
                title: "Team Collaboration",
                description: "Real-time editing, comments, and approval workflows",
                icon: "👥"
              },
              {
                title: "Export & Deploy",
                description: "Export to multiple formats and deploy to production",
                icon: "🚀"
              },
              {
                title: "Version Control",
                description: "Track changes and rollback to previous versions",
                icon: "📝"
              },
              {
                title: "Analytics Dashboard",
                description: "Monitor prompt performance and usage metrics",
                icon: "📊"
              }
            ].map((feature, index) => (
              <Card key={index} className="p-6 text-center bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-200">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

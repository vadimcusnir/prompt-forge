"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import BackgroundRoot from "@/components/bg/BackgroundRoot"

export default function HomePage() {
  const [isHovered, setIsHovered] = useState<string | null>(null)

  const features = [
    {
      id: "ai-modules",
      title: "50+ AI Modules",
      description: "Specialized prompt engineering modules for every domain",
      icon: "🧠",
      color: "from-blue-500/20 to-cyan-500/20",
      badge: "Core Feature"
    },
    {
      id: "prompt-systems",
      title: "Prompt Systems",
      description: "Build scalable, maintainable prompt architectures",
      icon: "🏗️",
      color: "from-purple-500/20 to-pink-500/20",
      badge: "Enterprise"
    },
    {
      id: "export-formats",
      title: "Multi-Format Export",
      description: "Export to .md, .json, .pdf with version control",
      icon: "📤",
      color: "from-green-500/20 to-emerald-500/20",
      badge: "Pro"
    },
    {
      id: "collaboration",
      title: "Team Collaboration",
      description: "Real-time editing, comments, and approval workflows",
      icon: "👥",
      color: "from-orange-500/20 to-red-500/20",
      badge: "Team"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* AI-IDEI™ Background System - 8 layere animate */}
      <BackgroundRoot 
        profile="ambient_minimal"
        routeKey="/"
        motionLevel="auto"
        enableMatrix={true}
        enableQuotes={true}
        enableFigures={true}
        enableMicroUI={true}
      />
      
      {/* Header - Mobile First */}
      <header className="container max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          {/* Logo & Brand */}
          <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 sm:w-6 sm:h-6 bg-primary-foreground rounded-sm"></div>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-foreground">PROMPTFORGE™</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">v3.0</p>
            </div>
          </div>
          
          {/* Navigation - Hidden pe mobile, visible pe desktop */}
          <nav className="hidden sm:flex items-center space-x-6 lg:space-x-8">
            <a href="/coming-soon" className="text-sm lg:text-base text-muted-foreground hover:text-foreground transition-colors duration-200">
              Waitlist
            </a>
            <a href="/pricing" className="text-sm lg:text-base text-muted-foreground hover:text-foreground transition-colors duration-200">
              Pricing
            </a>
            <Button variant="outline" size="sm" className="hidden lg:flex">
              Sign In
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button variant="outline" size="sm" className="sm:hidden w-full">
            Menu
          </Button>
        </div>
      </header>

      {/* Hero Section - Mobile First */}
      <section className="pf-hero container max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16 lg:py-24 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Badge */}
          <Badge variant="secondary" className="mb-4 sm:mb-6 text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2">
            🚀 Coming Soon - Join the Revolution
          </Badge>

          {/* Hero Title - Responsive Typography */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-heading font-extrabold text-foreground mb-4 sm:mb-6 lg:mb-8 leading-tight">
            Build Prompt Systems,
            <span className="block text-primary">Not Throwaway Lines</span>
          </h1>

          {/* Hero Subtitle - Responsive */}
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-muted-foreground mb-6 sm:mb-8 lg:mb-10 max-w-2xl mx-auto leading-relaxed">
            PROMPTFORGE™ v3.0 brings enterprise-grade prompt engineering with 50+ specialized AI modules, 
            collaborative workflows, and multi-format export capabilities.
          </p>

          {/* CTA Buttons - Stack pe mobile, inline pe desktop */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Button 
              size="lg"
              className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold"
              onClick={() => window.location.href = '/coming-soon'}
            >
              Join the Waitlist
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg"
              onClick={() => window.location.href = '/pricing'}
            >
              View Pricing
            </Button>
          </div>

          {/* Social Proof - Responsive */}
          <div className="mt-8 sm:mt-10 lg:mt-12 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-muted-foreground">
            <span>✓ 10,000+ developers waiting</span>
            <span>✓ Enterprise-ready architecture</span>
            <span>✓ SOC 2 compliant</span>
          </div>
        </div>
      </section>

      {/* Features Section - Mobile First Grid */}
      <section className="container max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16 lg:py-24 relative z-10">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-heading font-bold text-foreground mb-4 sm:mb-6">
            Why PROMPTFORGE™?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            Built for teams who need more than just a prompt editor
          </p>
        </div>

        {/* Features Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature) => (
            <Card
              key={feature.id}
              className={`glass-effect p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl text-center transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer ${
                isHovered === feature.id ? 'ring-2 ring-primary/50' : ''
              }`}
              onMouseEnter={() => setIsHovered(feature.id)}
              onMouseLeave={() => setIsHovered(null)}
            >
              {/* Feature Icon */}
              <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl`}>
                {feature.icon}
              </div>

              {/* Feature Badge */}
              <Badge variant="secondary" className="mb-3 sm:mb-4 text-xs">
                {feature.badge}
              </Badge>

              {/* Feature Title */}
              <h3 className="text-lg sm:text-xl lg:text-2xl font-heading font-semibold text-foreground mb-2 sm:mb-3">
                {feature.title}
              </h3>

              {/* Feature Description */}
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section - Mobile First */}
      <section className="container max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="glass-strong rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4 sm:mb-6">
            Ready to Transform Your AI Workflow?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join thousands of developers and teams waiting for PROMPTFORGE™ v3.0
          </p>
          <Button 
            size="lg"
            className="w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg font-semibold"
            onClick={() => window.location.href = '/coming-soon'}
          >
            Get Early Access
          </Button>
        </div>
      </section>

      {/* Footer - Mobile First */}
      <footer className="container max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-10 lg:py-12 mt-16 sm:mt-24 lg:mt-32 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-primary-foreground rounded-sm"></div>
              </div>
              <span className="text-lg font-heading font-bold">PROMPTFORGE™</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Building the future of prompt engineering
            </p>
          </div>

          {/* Product */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-foreground mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/coming-soon" className="hover:text-foreground transition-colors">Waitlist</a></li>
              <li><a href="/pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-foreground mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-foreground mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/terms" className="hover:text-foreground transition-colors">Privacy</a></li>
              <li><a href="/terms" className="hover:text-foreground transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border/20 mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © 2025 PromptForge™. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

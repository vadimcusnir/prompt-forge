'use client';

export default function ComingSoonPage() {
  return (
    <>
      <main className="relative z-10 min-h-screen">
        {/* Hero Section - Mobile First */}
        <section className="pf-hero container max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Hero Badge - dimensiuni fixe pentru a evita CLS */}
            <span className="inline-flex items-center justify-center rounded-md border font-medium whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 mb-4 sm:mb-6 text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 min-h-[32px] sm:min-h-[36px] min-w-[200px] sm:min-w-[250px]">
              🚀 Coming Soon - Join the Revolution
            </span>

            {/* Hero Title - Responsive Typography */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-heading font-bold text-foreground mb-4 sm:mb-6 lg:mb-8 leading-tight">
              PROMPTFORGE™
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 lg:mb-10 max-w-3xl mx-auto leading-relaxed">
              The ultimate prompt engineering platform. Build, test, and deploy AI prompts at scale.
            </p>

            {/* CTA Section - Client Component */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4 min-h-[20px]">
                Join the waitlist to be notified when we launch
              </p>
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors min-h-[48px] min-w-[140px] font-medium">
                Join Waitlist
              </button>
            </div>
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
              <div key={index} className="text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm p-6 text-center bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-200">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

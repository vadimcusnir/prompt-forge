export default function TestThemePage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-4xl font-bold mb-6">Dark Theme Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-card text-card-foreground rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">Card Background</h2>
          <p>This should have a dark background if the theme is working.</p>
        </div>
        
        <div className="p-4 bg-secondary text-secondary-foreground rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Secondary Background</h2>
          <p>This should have a secondary dark background.</p>
        </div>
        
        <div className="p-4 bg-muted text-muted-foreground rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Muted Background</h2>
          <p>This should have a muted dark background.</p>
        </div>
        
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
          Primary Button
        </button>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 text-gray-900 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Light Background Test</h2>
        <p>This should remain light to show contrast.</p>
      </div>
    </div>
  )
}

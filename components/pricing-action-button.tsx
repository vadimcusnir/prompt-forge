'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, CreditCard, Loader2 } from 'lucide-react'

interface PricingActionButtonProps {
  priceId: string
  amount: number
  currency: string
  planName: string
  isEnterprise?: boolean
}

export function PricingActionButton({ 
  priceId, 
  amount, 
  currency, 
  planName, 
  isEnterprise = false 
}: PricingActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [leadData, setLeadData] = useState({ name: '', email: '', company: '', message: '' })

  // Enterprise: Formular de lead
  if (isEnterprise) {
    return (
      <div className="space-y-4">
        <Button 
          onClick={() => setShowLeadForm(true)}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          size="lg"
        >
          <Mail className="w-4 h-4 mr-2" />
          Get Custom Quote
        </Button>

        {showLeadForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Enterprise Inquiry</h3>
              
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={leadData.name}
                  onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={leadData.email}
                  onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={leadData.company}
                  onChange={(e) => setLeadData({ ...leadData, company: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
                <textarea
                  placeholder="Tell us about your needs..."
                  value={leadData.message}
                  onChange={(e) => setLeadData({ ...leadData, message: e.target.value })}
                  className="w-full p-2 border rounded h-20"
                  required
                />
                
                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Send Inquiry'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowLeadForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Restul planurilor: Checkout Stripe
  const handleCheckout = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          customerEmail: 'user@example.com', // Va fi din auth
          customerName: 'User Name', // Va fi din auth
          successUrl: `${window.location.origin}/profilul-meu?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
          mode: 'subscription'
        })
      })

      const data = await response.json()
      
      if (data.url) {
        // Redirect la Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
      
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleCheckout}
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
      size="lg"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : (
        <CreditCard className="w-4 h-4 mr-2" />
      )}
      {amount === 0 ? 'Get Started Free' : `Subscribe for $${(amount / 100).toFixed(2)}`}
    </Button>
  )
}

async function handleLeadSubmit(e: React.FormEvent) {
  e.preventDefault()
  // TODO: Implement lead submission API
  console.log('Lead data:', leadData)
  alert('Thank you! We will contact you soon.')
}

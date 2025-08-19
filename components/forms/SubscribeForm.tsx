'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      // TODO: Implement actual email submission
      console.log('Email submitted:', email);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="p-6 sm:p-8 max-w-md mx-auto bg-card/50 backdrop-blur-sm border-border/50 min-h-[280px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 min-h-[32px] sm:min-h-[36px]">You're on the list!</h2>
          <p className="text-muted-foreground min-h-[20px]">We'll notify you when PROMPTFORGE™ launches.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8 max-w-md mx-auto bg-card/50 backdrop-blur-sm border-border/50 min-h-[280px]">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 min-h-[32px] sm:min-h-[36px]">Get Early Access</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 min-h-[48px]"
            required
          />
        </div>
        <Button type="submit" className="w-full min-h-[48px]" size="lg">
          Join Waitlist
        </Button>
      </form>
    </Card>
  );
}

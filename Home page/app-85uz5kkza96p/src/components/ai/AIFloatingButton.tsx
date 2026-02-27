import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sparkles } from 'lucide-react';
import AIChat from './AIChat';

export default function AIFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full gradient-rainbow animate-gradient animate-pulse-glow hover-scale z-50 border-2 border-white/20 shadow-2xl"
        onClick={() => setIsOpen(true)}
      >
        <Sparkles className="h-7 w-7 animate-float" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col glass-morphism border-2 border-primary/30 animate-fade-in-up p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
            <DialogTitle className="flex items-center gap-3">
              <div className="gradient-primary p-2 rounded-lg animate-pulse-glow shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-bold">
                AI Data Assistant
              </span>
            </DialogTitle>
            <DialogDescription className="text-base">
              Ask questions about your geospatial data and get AI-powered insights, analysis, and recommendations
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden px-6 pb-6">
            <AIChat />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

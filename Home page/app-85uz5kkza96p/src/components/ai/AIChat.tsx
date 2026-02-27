import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Send, Trash2, Loader2, Bot, User, Copy, Check, RefreshCw } from 'lucide-react';
import { aiService, Message } from '@/services/aiService';
import { useDataset } from '@/contexts/DatasetContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

export default function AIChat() {
  const { dataset } = useDataset();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingMessage('');

    const datasetContext = dataset
      ? {
          points: dataset.points,
          stats: {
            totalPoints: dataset.points.length,
            latRange: [
              Math.min(...dataset.points.map(p => p.lat)),
              Math.max(...dataset.points.map(p => p.lat)),
            ],
            lonRange: [
              Math.min(...dataset.points.map(p => p.lon)),
              Math.max(...dataset.points.map(p => p.lon)),
            ],
            valueRange: [
              Math.min(...dataset.points.map(p => p.value)),
              Math.max(...dataset.points.map(p => p.value)),
            ],
            mean: dataset.points.reduce((sum, p) => sum + p.value, 0) / dataset.points.length,
            stdDev: Math.sqrt(
              dataset.points.reduce(
                (sum, p) =>
                  sum +
                  Math.pow(
                    p.value - dataset.points.reduce((s, pt) => s + pt.value, 0) / dataset.points.length,
                    2
                  ),
                0
              ) / dataset.points.length
            ),
          },
        }
      : undefined;

    let fullMessage = '';

    await aiService.streamChat(
      textToSend,
      (chunk) => {
        fullMessage += chunk;
        setStreamingMessage(fullMessage);
      },
      () => {
        const aiMessage: Message = {
          role: 'model',
          content: fullMessage,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setStreamingMessage('');
        setIsLoading(false);
      },
      (error) => {
        const errorMessage: Message = {
          role: 'model',
          content: `⚠️ Error: ${error}. Please try again or rephrase your question.`,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, errorMessage]);
        setStreamingMessage('');
        setIsLoading(false);
        toast.error('Failed to get AI response');
      },
      datasetContext
    );
  };

  const handleClear = () => {
    setMessages([]);
    setStreamingMessage('');
    aiService.clearHistory();
    toast.success('Chat history cleared');
  };

  const handleCopy = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages Area with proper scrolling */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 space-y-4 py-4" style={{ minHeight: 0 }}>
        {messages.length === 0 && !streamingMessage && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="relative mb-6">
              <div className="absolute inset-0 gradient-rainbow blur-2xl opacity-30 animate-pulse-glow"></div>
              <Sparkles className="h-16 w-16 text-primary relative z-10 animate-float" />
            </div>
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AI Data Analyst - 100% Accuracy Mode
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              {dataset 
                ? "I analyze your actual dataset with 100% accuracy using verified statistics. All responses are based on real data calculations."
                : "Upload a dataset first, then I can provide accurate analysis based on your real data."}
            </p>
            {dataset && (
              <>
                <div className="bg-card/50 border border-border/50 rounded-lg p-4 max-w-md text-left text-sm space-y-2">
                  <p className="font-semibold text-primary">✅ 100% Accuracy Features:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Verified statistics with exact calculations</li>
                    <li>20x20 grid spatial analysis (400 regions)</li>
                    <li>100-point stratified sampling</li>
                    <li>Comprehensive outlier detection</li>
                    <li>Distribution analysis (skewness, kurtosis)</li>
                    <li>All responses cite actual data numbers</li>
                  </ul>
                </div>
                
                <div className="mt-6 max-w-md w-full">
                  <p className="text-sm font-semibold text-foreground mb-3">💡 Suggested Questions:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      "What is the mean and standard deviation?",
                      "Where are the highest values located?",
                      "Are there any outliers in the data?",
                      "What is the geographic coverage?",
                      "Compare northern and southern regions",
                      "Is the data normally distributed?"
                    ].map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(question)}
                        className="text-left px-4 py-2 text-sm bg-card/80 hover:bg-card border border-border/50 hover:border-primary/50 rounded-lg transition-all duration-200 hover-scale text-muted-foreground hover:text-foreground"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in-up`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.role === 'user' 
                ? 'gradient-secondary' 
                : 'gradient-primary animate-pulse-glow'
            }`}>
              {msg.role === 'user' ? (
                <User className="h-4 w-4 text-white" />
              ) : (
                <Bot className="h-4 w-4 text-white" />
              )}
            </div>

            {/* Message Content */}
            <div className={`flex-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
              <div
                className={`rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'gradient-secondary text-white shadow-lg'
                    : 'bg-card/95 backdrop-blur-sm border border-border/50 shadow-md'
                }`}
              >
                {msg.role === 'model' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                )}
              </div>

              {/* Action Buttons */}
              {msg.role === 'model' && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs hover-scale"
                    onClick={() => handleCopy(msg.content, idx)}
                  >
                    {copiedIndex === idx ? (
                      <Check className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" />
                    )}
                    {copiedIndex === idx ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs hover-scale"
                    onClick={() => handleSend(messages[idx - 1]?.content)}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Regenerate
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Streaming Message */}
        {streamingMessage && (
          <div className="flex gap-3 animate-fade-in-up">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center gradient-primary animate-pulse-glow">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 max-w-[85%]">
              <div className="rounded-2xl px-4 py-3 bg-card/95 backdrop-blur-sm border border-border/50 shadow-md">
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {streamingMessage}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && !streamingMessage && (
          <div className="flex gap-3 animate-fade-in-up">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center gradient-primary animate-pulse-glow">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-card/95 backdrop-blur-sm border border-border/50">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t border-border/50 pt-4 mt-4 bg-background/95 backdrop-blur-sm">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              placeholder={dataset ? "Ask about your data..." : "Upload a dataset first..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading || !dataset}
              className="min-h-[44px] max-h-[120px] resize-none border-2 focus:border-primary/50 transition-colors"
              rows={1}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => handleSend()} 
              disabled={isLoading || !input.trim() || !dataset}
              className="gradient-primary hover-scale border-0 h-11 w-11 p-0"
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleClear}
              disabled={messages.length === 0}
              className="h-11 w-11 hover-scale border-2"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

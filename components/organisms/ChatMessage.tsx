import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Copy, Check } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Card, CardContent } from '../molecules/Card';
import { Icon } from '../atoms/Icon';
import { cn } from '@/lib/utils';

export interface ChatMessageProps {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isGenerating?: boolean;
  onCopy?: (content: string) => void;
  className?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  role,
  timestamp,
  isGenerating = false,
  onCopy,
  className
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (onCopy) {
      onCopy(content);
    } else {
      await navigator.clipboard.writeText(content);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex gap-3 p-4 group',
        isUser ? 'bg-muted/30' : 'bg-background',
        className
      )}
    >
      {/* Avatar */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        isUser ? 'bg-blue-500' : 'bg-green-500'
      )}>
        <Icon
          icon={isUser ? User : Bot}
          size={16}
          className="text-white"
        />
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {isUser ? 'You' : 'Assistant'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {timestamp.toLocaleTimeString()}
                </span>
              </div>

              {!isGenerating && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                >
                  <Icon
                    icon={copied ? Check : Copy}
                    size={14}
                    className={cn(
                      copied ? 'text-green-500' : 'text-muted-foreground'
                    )}
                  />
                </Button>
              )}
            </div>

            <div className="prose prose-sm max-w-none">
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-muted-foreground">Generating response...</span>
                </div>
              ) : (
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {content}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default ChatMessage;

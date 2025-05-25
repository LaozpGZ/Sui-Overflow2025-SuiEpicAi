import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  display?: React.ReactNode;
  className?: string;
  tooltip?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ value, display, className, tooltip }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      // ignore
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn("ml-2 p-2", className)}
            onClick={handleCopy}
            aria-label={copied ? "Copied" : tooltip || "Copy"}
            disabled={copied}
          >
            {copied ? <Check className="text-emerald-500" size={16} /> : <Copy size={16} />}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="px-2 py-1 text-xs">
          {copied ? "Copied!" : tooltip || "Copy"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CopyButton; 
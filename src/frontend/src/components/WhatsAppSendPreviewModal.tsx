import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, AlertCircle } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';

interface WhatsAppSendPreviewModalProps {
  open: boolean;
  onClose: () => void;
  message: string;
  onConfirmSend: () => void;
  isBlocked: boolean;
  blockReason?: string;
}

export default function WhatsAppSendPreviewModal({
  open,
  onClose,
  message,
  onConfirmSend,
  isBlocked,
  blockReason,
}: WhatsAppSendPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SiWhatsapp className="h-5 w-5 text-green-600" />
            Message Preview
          </DialogTitle>
          <DialogDescription>
            Review your order message before sending it on WhatsApp
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Message to be sent:</label>
            <Textarea
              value={message}
              readOnly
              className="font-mono text-sm min-h-[200px] bg-muted resize-none"
            />
          </div>

          {isBlocked && blockReason && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{blockReason}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirmSend}
            disabled={isBlocked}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Confirm & Send on WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

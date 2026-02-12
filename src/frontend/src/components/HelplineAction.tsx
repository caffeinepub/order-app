import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { useAppSettings } from '@/hooks/useAppSettings';

export default function HelplineAction() {
  const { helplinePhone } = useAppSettings();

  if (!helplinePhone || !helplinePhone.trim()) {
    return null;
  }

  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <a href={`tel:${helplinePhone.trim()}`}>
        <Phone className="h-4 w-4" />
        <span className="hidden sm:inline">Helpline</span>
      </a>
    </Button>
  );
}

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppSettings } from '@/hooks/useAppSettings';

export default function SettingsCard() {
  const { appName, helplinePhone, setAppName, setHelplinePhone } = useAppSettings();
  const [localAppName, setLocalAppName] = useState(appName);
  const [localHelplinePhone, setLocalHelplinePhone] = useState(helplinePhone);

  const handleSave = () => {
    setAppName(localAppName);
    setHelplinePhone(localHelplinePhone);
  };

  const hasChanges = 
    localAppName !== appName || 
    localHelplinePhone !== helplinePhone;

  return (
    <Card className="shadow-lg border-2">
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Input
            id="helpline-phone"
            type="tel"
            placeholder="+1234567890"
            value={localHelplinePhone}
            onChange={(e) => setLocalHelplinePhone(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            This number will be shown as a tappable click-to-call helpline button in the header.
          </p>
        </div>

        {hasChanges && (
          <Button onClick={handleSave} className="w-full">
            Save Changes
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from 'react';

const APP_NAME_KEY = 'app-name';
const HELPLINE_PHONE_KEY = 'helpline-phone';

export function useAppSettings() {
  const [appName, setAppNameState] = useState<string>('Order App');
  const [helplinePhone, setHelplinePhoneState] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedAppName = localStorage.getItem(APP_NAME_KEY);
    const savedHelplinePhone = localStorage.getItem(HELPLINE_PHONE_KEY);
    
    if (savedAppName) {
      setAppNameState(savedAppName);
    }
    if (savedHelplinePhone) {
      setHelplinePhoneState(savedHelplinePhone);
    }
    setIsLoaded(true);
  }, []);

  const setAppName = (name: string) => {
    setAppNameState(name);
    localStorage.setItem(APP_NAME_KEY, name);
    document.title = name || 'Order App';
  };

  const setHelplinePhone = (phone: string) => {
    setHelplinePhoneState(phone);
    localStorage.setItem(HELPLINE_PHONE_KEY, phone);
  };

  useEffect(() => {
    if (isLoaded) {
      document.title = appName || 'Order App';
    }
  }, [appName, isLoaded]);

  return {
    appName,
    helplinePhone,
    setAppName,
    setHelplinePhone,
    isLoaded,
  };
}

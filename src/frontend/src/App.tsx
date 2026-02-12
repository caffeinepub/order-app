import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, AlertCircle, Download, Eye, FileSpreadsheet } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { useImportedLists } from '@/hooks/useImportedLists';
import { parseImportedLists } from '@/lib/importLists/parseImportedLists';
import { useAppSettings } from '@/hooks/useAppSettings';
import SettingsCard from '@/components/SettingsCard';
import PublishSellGuidance from '@/components/PublishSellGuidance';
import WhatsAppSendPreviewModal from '@/components/WhatsAppSendPreviewModal';
import HelplineAction from '@/components/HelplineAction';

interface LineItem {
  id: string;
  quantity: string;
  size: string;
  itemName: string;
}

const PRESET_SIZES = ['200 L', '100 L', '20 L', '10 L', '4 L', '1 L'];

function App() {
  const [partyName, setPartyName] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', quantity: '1', size: '20 L', itemName: '' },
    { id: '2', quantity: '20', size: '4 L', itemName: '' },
    { id: '3', quantity: '30', size: '1 L', itemName: '' },
  ]);
  const [validationError, setValidationError] = useState('');
  const [importError, setImportError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState('');
  const [customSizeInputs, setCustomSizeInputs] = useState<Record<string, boolean>>({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const { parties, items, hasImportedLists, saveImportedLists, clearImportedLists } = useImportedLists();
  const { appName } = useAppSettings();

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      quantity: '',
      size: '1 L',
      itemName: '',
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
      const newCustomSizeInputs = { ...customSizeInputs };
      delete newCustomSizeInputs[id];
      setCustomSizeInputs(newCustomSizeInputs);
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSizeChange = (id: string, value: string) => {
    if (value === 'other') {
      setCustomSizeInputs({ ...customSizeInputs, [id]: true });
      updateLineItem(id, 'size', '');
    } else {
      setCustomSizeInputs({ ...customSizeInputs, [id]: false });
      updateLineItem(id, 'size', value);
    }
  };

  const generateMessage = (): string => {
    const completeItems = lineItems.filter(
      (item) => item.quantity && item.size && item.itemName.trim()
    );

    if (!partyName.trim()) return '';

    let message = `Party Name: ${partyName.trim()}\n\n`;
    
    completeItems.forEach((item) => {
      message += `${item.quantity} x ${item.size} ${item.itemName.trim()}\n`;
    });

    return message.trim();
  };

  const validateOrder = (): boolean => {
    setValidationError('');

    if (!partyName.trim()) {
      setValidationError('Please enter a Party Name before proceeding.');
      return false;
    }

    const completeItems = lineItems.filter(
      (item) => item.quantity && item.size && item.itemName.trim()
    );

    if (completeItems.length === 0) {
      setValidationError('Please add at least one complete line item (quantity, size, and item name).');
      return false;
    }

    return true;
  };

  const handleOpenPreview = () => {
    if (validateOrder()) {
      setShowPreviewModal(true);
    }
  };

  const handleConfirmSend = () => {
    const message = generateMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setShowPreviewModal(false);
  };

  const handleClosePreview = () => {
    setShowPreviewModal(false);
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError('');
    setImportSuccess('');

    try {
      const result = await parseImportedLists(file);

      if (result.errors.length > 0) {
        setImportError(result.errors.join(' '));
      } else {
        saveImportedLists(result.parties, result.items);
        const partiesCount = result.parties.length;
        const itemsCount = result.items.length;
        const successParts: string[] = [];
        if (partiesCount > 0) successParts.push(`${partiesCount} ${partiesCount === 1 ? 'party' : 'parties'}`);
        if (itemsCount > 0) successParts.push(`${itemsCount} ${itemsCount === 1 ? 'item' : 'items'}`);
        setImportSuccess(`Successfully imported ${successParts.join(' and ')}!`);
      }
    } catch (error) {
      setImportError(
        `Failed to import file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  const handleClearImportedLists = () => {
    clearImportedLists();
    setImportSuccess('');
    setImportError('');
  };

  const handleDownloadTemplate = (format: 'csv' | 'xlsx') => {
    const templatePath = format === 'csv' 
      ? '/assets/templates/import-lists-sample.csv'
      : '/assets/templates/import-lists-template.xlsx';
    
    const link = document.createElement('a');
    link.href = templatePath;
    link.download = `import-lists-template.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SiWhatsapp className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {appName}
            </h1>
          </div>
          <HelplineAction />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Order Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SiWhatsapp className="h-5 w-5 text-green-600" />
                Create Order
              </CardTitle>
              <CardDescription>Fill in the order details and send via WhatsApp</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Party Name */}
              <div className="space-y-2">
                <Label htmlFor="partyName">Party Name *</Label>
                {hasImportedLists && parties.length > 0 ? (
                  <Select value={partyName} onValueChange={setPartyName}>
                    <SelectTrigger id="partyName">
                      <SelectValue placeholder="Select a party" />
                    </SelectTrigger>
                    <SelectContent>
                      {parties.map((party) => (
                        <SelectItem key={party} value={party}>
                          {party}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="partyName"
                    placeholder="Enter party name"
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                  />
                )}
              </div>

              {/* Line Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Line Items</Label>
                  <Button onClick={addLineItem} size="sm" variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {lineItems.map((item) => {
                    const isCustomSize = customSizeInputs[item.id] || (!PRESET_SIZES.includes(item.size) && item.size !== '');
                    const selectValue = isCustomSize ? 'other' : (item.size || '1 L');

                    return (
                      <div key={item.id} className="flex gap-2 items-start">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <Input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                            min="0"
                          />
                          <div className="space-y-2">
                            <Select
                              value={selectValue}
                              onValueChange={(value) => handleSizeChange(item.id, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Size" />
                              </SelectTrigger>
                              <SelectContent>
                                {PRESET_SIZES.map((size) => (
                                  <SelectItem key={size} value={size}>
                                    {size}
                                  </SelectItem>
                                ))}
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            {isCustomSize && (
                              <Input
                                placeholder="Enter custom size"
                                value={item.size}
                                onChange={(e) => updateLineItem(item.id, 'size', e.target.value)}
                              />
                            )}
                          </div>
                          {hasImportedLists && items.length > 0 ? (
                            <Select
                              value={item.itemName}
                              onValueChange={(value) => updateLineItem(item.id, 'itemName', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select item" />
                              </SelectTrigger>
                              <SelectContent>
                                {items.map((itemName) => (
                                  <SelectItem key={itemName} value={itemName}>
                                    {itemName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              placeholder="Item name"
                              value={item.itemName}
                              onChange={(e) => updateLineItem(item.id, 'itemName', e.target.value)}
                            />
                          )}
                        </div>
                        <Button
                          onClick={() => removeLineItem(item.id)}
                          size="icon"
                          variant="ghost"
                          disabled={lineItems.length === 1}
                          className="shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Validation Error */}
              {validationError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}

              {/* Preview Message */}
              {partyName.trim() && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <Textarea
                    value={generateMessage()}
                    readOnly
                    className="min-h-[150px] font-mono text-sm bg-muted"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleOpenPreview}
                  className="flex-1 gap-2"
                  variant="default"
                >
                  <Eye className="h-4 w-4" />
                  Message Preview
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Import Lists */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Import Party & Item Lists
              </CardTitle>
              <CardDescription>
                Upload a CSV or Excel file to import party names and item names for quick selection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Download Templates */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownloadTemplate('csv')}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download CSV Template
                </Button>
                <Button
                  onClick={() => handleDownloadTemplate('xlsx')}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Excel Template
                </Button>
              </div>

              {/* Import Status */}
              {importSuccess && (
                <Alert>
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    {importSuccess}
                  </AlertDescription>
                </Alert>
              )}

              {importError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{importError}</AlertDescription>
                </Alert>
              )}

              {/* Import Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => document.getElementById('file-import')?.click()}
                  disabled={isImporting}
                  variant="default"
                  className="gap-2"
                >
                  {isImporting ? 'Importing...' : 'Import File'}
                </Button>
                {hasImportedLists && (
                  <Button
                    onClick={handleClearImportedLists}
                    variant="outline"
                    className="gap-2"
                  >
                    Clear Imported Lists
                  </Button>
                )}
              </div>

              <input
                id="file-import"
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileImport}
                className="hidden"
              />

              {hasImportedLists && (
                <div className="text-sm text-muted-foreground">
                  Currently loaded: {parties.length} {parties.length === 1 ? 'party' : 'parties'}, {items.length} {items.length === 1 ? 'item' : 'items'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <SettingsCard />

          {/* Publish & Sell Guidance */}
          <PublishSellGuidance />
        </div>
      </main>

      <footer className="border-t mt-auto py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'unknown-app'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      <WhatsAppSendPreviewModal
        open={showPreviewModal}
        onClose={handleClosePreview}
        message={generateMessage()}
        onConfirmSend={handleConfirmSend}
        isBlocked={false}
        blockReason={undefined}
      />
    </div>
  );
}

export default App;

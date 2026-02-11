import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Send, AlertCircle, Upload, X, FileSpreadsheet, Download } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { useImportedLists } from '@/hooks/useImportedLists';
import { parseImportedLists } from '@/lib/importLists/parseImportedLists';

interface LineItem {
  id: string;
  quantity: string;
  size: string;
  itemName: string;
}

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

  const { parties, items, hasImportedLists, saveImportedLists, clearImportedLists, isLoaded } =
    useImportedLists();

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
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const generateMessage = (): string => {
    const completeItems = lineItems.filter(
      (item) => item.quantity && item.size && item.itemName.trim()
    );

    if (!partyName.trim()) return '';

    let message = `Party Name: ${partyName.trim()}\n`;
    completeItems.forEach((item) => {
      message += `${item.quantity} x ${item.size} ${item.itemName.trim()}\n`;
    });

    return message.trim();
  };

  const handleSendWhatsApp = () => {
    setValidationError('');

    if (!partyName.trim()) {
      setValidationError('Please enter a Party Name before sending.');
      return;
    }

    const completeItems = lineItems.filter(
      (item) => item.quantity && item.size && item.itemName.trim()
    );

    if (completeItems.length === 0) {
      setValidationError('Please add at least one complete line item (quantity, size, and item name).');
      return;
    }

    const message = generateMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
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
      // Reset file input
      event.target.value = '';
    }
  };

  const handleClearImportedLists = () => {
    clearImportedLists();
    setImportSuccess('');
    setImportError('');
  };

  const message = generateMessage();
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(window.location.hostname || 'order-app');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Order App
          </h1>
          <p className="text-muted-foreground">Create and share your orders instantly</p>
        </header>

        <main className="grid lg:grid-cols-2 gap-6">
          {/* Order Form */}
          <div className="space-y-6">
            {/* Import Lists Card */}
            <Card className="shadow-lg border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Import Lists
                </CardTitle>
                <CardDescription>
                  Upload a CSV or Excel file with party names and item names. For CSV, use columns named "partyName" or "itemName". For Excel, use sheets named "Parties" and "Items".
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Download Templates Section */}
                <div className="p-3 bg-muted/50 rounded-lg border space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Download sample templates:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <a
                        href="/assets/templates/import-lists-sample.csv"
                        download="import-lists-sample.csv"
                      >
                        <Download className="h-4 w-4" />
                        CSV Template
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <a
                        href="/assets/templates/import-lists-template.xlsx"
                        download="import-lists-template.xlsx"
                      >
                        <Download className="h-4 w-4" />
                        Excel Template
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="file-import" className="sr-only">
                      Import file
                    </Label>
                    <div className="relative">
                      <Input
                        id="file-import"
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileImport}
                        disabled={isImporting}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                  {hasImportedLists && (
                    <Button
                      onClick={handleClearImportedLists}
                      variant="outline"
                      size="icon"
                      title="Clear imported lists"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {isImporting && (
                  <Alert>
                    <Upload className="h-4 w-4 animate-pulse" />
                    <AlertDescription>Importing file...</AlertDescription>
                  </Alert>
                )}

                {importError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{importError}</AlertDescription>
                  </Alert>
                )}

                {importSuccess && (
                  <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
                    <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-300">
                      {importSuccess}
                    </AlertDescription>
                  </Alert>
                )}

                {hasImportedLists && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    {parties.length > 0 && (
                      <p>✓ {parties.length} {parties.length === 1 ? 'party' : 'parties'} available</p>
                    )}
                    {items.length > 0 && (
                      <p>✓ {items.length} {items.length === 1 ? 'item' : 'items'} available</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Details Card */}
            <Card className="shadow-lg border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  Order Details
                </CardTitle>
                <CardDescription>Fill in the party name and line items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Party Name */}
                <div className="space-y-2">
                  <Label htmlFor="partyName" className="text-base font-semibold">
                    Party Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="partyName"
                    placeholder="Enter party name"
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    className="text-base"
                    list={parties.length > 0 ? 'parties-list' : undefined}
                  />
                  {parties.length > 0 && (
                    <datalist id="parties-list">
                      {parties.map((party) => (
                        <option key={party} value={party} />
                      ))}
                    </datalist>
                  )}
                </div>

                {/* Line Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Line Items</Label>
                    <Button
                      onClick={addLineItem}
                      size="sm"
                      variant="outline"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {lineItems.map((item, index) => (
                      <Card key={item.id} className="p-4 bg-muted/30">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              Item #{index + 1}
                            </span>
                            {lineItems.length > 1 && (
                              <Button
                                onClick={() => removeLineItem(item.id)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-[1fr_1.5fr_2fr] gap-2">
                            <div className="space-y-1">
                              <Label htmlFor={`qty-${item.id}`} className="text-xs">
                                Qty
                              </Label>
                              <Input
                                id={`qty-${item.id}`}
                                type="number"
                                min="0"
                                placeholder="0"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateLineItem(item.id, 'quantity', e.target.value)
                                }
                                className="text-sm"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label htmlFor={`size-${item.id}`} className="text-xs">
                                Size
                              </Label>
                              <Select
                                value={item.size}
                                onValueChange={(value) =>
                                  updateLineItem(item.id, 'size', value)
                                }
                              >
                                <SelectTrigger id={`size-${item.id}`} className="text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="20 L">20 L</SelectItem>
                                  <SelectItem value="10 L">10 L</SelectItem>
                                  <SelectItem value="5 L">5 L</SelectItem>
                                  <SelectItem value="4 L">4 L</SelectItem>
                                  <SelectItem value="2 L">2 L</SelectItem>
                                  <SelectItem value="1 L">1 L</SelectItem>
                                  <SelectItem value="500 mL">500 mL</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1">
                              <Label htmlFor={`name-${item.id}`} className="text-xs">
                                Item Name
                              </Label>
                              <Input
                                id={`name-${item.id}`}
                                placeholder="Item name"
                                value={item.itemName}
                                onChange={(e) =>
                                  updateLineItem(item.id, 'itemName', e.target.value)
                                }
                                className="text-sm"
                                list={items.length > 0 ? 'items-list' : undefined}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Shared datalist for all item name inputs */}
                {items.length > 0 && (
                  <datalist id="items-list">
                    {items.map((itemName) => (
                      <option key={itemName} value={itemName} />
                    ))}
                  </datalist>
                )}

                {/* Validation Error */}
                {validationError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{validationError}</AlertDescription>
                  </Alert>
                )}

                {/* Send Button */}
                <Button
                  onClick={handleSendWhatsApp}
                  className="w-full gap-2 text-base h-12"
                  size="lg"
                >
                  <SiWhatsapp className="h-5 w-5" />
                  Send on WhatsApp
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Message Preview */}
          <Card className="shadow-lg border-2 lg:sticky lg:top-8 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Message Preview
              </CardTitle>
              <CardDescription>This is how your order will appear</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Textarea
                  value={message || 'Your order preview will appear here...'}
                  readOnly
                  className="min-h-[300px] font-mono text-sm bg-muted/50 resize-none"
                  placeholder="Your order preview will appear here..."
                />
                {message && (
                  <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-md">
                    <p className="text-xs text-muted-foreground">
                      ✓ Ready to send • {lineItems.filter(
                        (item) => item.quantity && item.size && item.itemName.trim()
                      ).length}{' '}
                      item(s)
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} • Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-foreground transition-colors underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

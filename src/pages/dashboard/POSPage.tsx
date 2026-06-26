import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { localDB, generateId, now } from "@/data/localStorageDB";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus, Trash2, ShoppingCart, ScanLine, Printer, CheckCircle, Percent, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface CartItem {
  id: string;
  product_id: string;
  batch_id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  max_quantity: number;
}

export default function POSPage() {
  const { organizationId, userRole, user } = useAuth();
  const { toast } = useToast();
  
  // New Schema State
  const [products, setProducts] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Advanced POS States
  const [barcode, setBarcode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [selectedCustomer, setSelectedCustomer] = useState("walk-in");
  const [discount, setDiscount] = useState(0);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

  useEffect(() => {
    if (!organizationId) return;
    setProducts(localDB.products.getByOrganizationId(organizationId));
    setBatches(localDB.productBatches.getByOrganizationId(organizationId));
    setCategories(localDB.categories.getByOrganizationId(organizationId));
    setCustomers(localDB.customers.getByOrganizationId(organizationId));
  }, [organizationId]);

  // Combine batches with product details for the POS grid
  const availableItems = batches.map(batch => {
    const product = products.find(p => p.id === batch.product_id) || { name: "Unknown", category_id: "" };
    const category = categories.find(c => c.id === product.category_id) || { name: "General" };
    return {
      ...batch,
      product_name: product.name,
      category_name: category.name,
      barcode: product.barcode
    };
  }).filter(b => b.quantity_remaining > 0);

  const addToCart = (item: any) => {
    const existing = cart.find(i => i.batch_id === item.id);
    if (existing) {
      if (existing.quantity < item.quantity_remaining) {
        setCart(cart.map(i => i.batch_id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      } else {
        toast({ title: "Stock Limit", description: "Cannot add more than available stock.", variant: "destructive" });
      }
    } else {
      setCart([...cart, { 
        id: generateId(), 
        product_id: item.product_id,
        batch_id: item.id, 
        name: item.product_name, 
        category: item.category_name,
        price: item.selling_price, 
        quantity: 1,
        max_quantity: item.quantity_remaining
      }]);
    }
  };

  const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const item = availableItems.find(i => i.batch_number === barcode || i.barcode === barcode || i.product_name.toLowerCase().includes(barcode.toLowerCase()));
      if (item) {
        addToCart(item);
        toast({ title: "Item Scanned", description: `${item.product_name} added to cart.` });
      } else {
        toast({ title: "Not Found", description: "No matching item or batch found.", variant: "destructive" });
      }
      setBarcode("");
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + change;
        if (newQty > item.max_quantity) {
          toast({ title: "Stock Limit", description: "Maximum available stock reached.", variant: "destructive" });
          return item;
        }
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const applyDiscount = () => {
    if (discountCode === "MGR123") {
      setDiscount(10); // 10% discount
      toast({ title: "Discount Approved", description: "10% Manager discount applied." });
      setIsDiscountDialogOpen(false);
    } else {
      toast({ title: "Approval Failed", description: "Invalid manager code.", variant: "destructive" });
    }
    setDiscountCode("");
  };

  const checkout = () => {
    if (!organizationId) return;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal - discountAmount;
    
    // Check credit limit if credit sale
    if (paymentMethod === "Credit" && selectedCustomer !== "walk-in") {
      const cust = customers.find(c => c.id === selectedCustomer);
      if (cust && ((cust.current_balance || 0) + total > cust.credit_limit)) {
         toast({ 
           title: "Credit Limit Exceeded", 
           description: `Remaining credit: ${(cust.credit_limit - (cust.current_balance || 0)).toLocaleString()} RWF.`, 
           variant: "destructive" 
         });
         return;
      }
    }

    // 1. Create Sale
    const sale = localDB.sales.create({
      organization_id: organizationId,
      customer_id: selectedCustomer === "walk-in" ? undefined : selectedCustomer,
      subtotal,
      discount_amount: discountAmount,
      vat_amount: total * 0.18,
      total_amount: total,
      payment_method: paymentMethod,
      status: paymentMethod === "Credit" ? "pending" : "Completed",
      timestamp: now()
    });

    // 2. Create Sale Items
    const itemsData = cart.map(cartItem => {
      return localDB.saleItems.create({
        organization_id: organizationId,
        sale_id: sale.id,
        product_id: cartItem.product_id,
        batch_id: cartItem.batch_id,
        quantity: cartItem.quantity,
        unit_price: cartItem.price,
        subtotal: cartItem.price * cartItem.quantity
      });
    });

    // 3. Update Batch Quantities & Record Movement
    let mTypes = localDB.movementTypes.getByOrganizationId(organizationId);
    let mType = mTypes.find(m => m.name === "OUT - Sale");
    if (!mType) {
      mType = localDB.movementTypes.create({ organization_id: organizationId, name: "OUT - Sale" });
    }

    cart.forEach(cartItem => {
      const batch = batches.find(b => b.id === cartItem.batch_id);
      if (batch) {
        localDB.productBatches.update(batch.id, {
          quantity_remaining: batch.quantity_remaining - cartItem.quantity
        });
        
        // Record Movement
        localDB.inventoryMovements.create({
          organization_id: organizationId,
          product_id: cartItem.product_id,
          batch_id: batch.id,
          movement_type_id: mType.id,
          quantity: cartItem.quantity,
          reference_id: sale.id,
          user_id: user?.id || "unknown",
          timestamp: now()
        });
      }
    });

    // 4. Update Customer Balance (If Credit)
    if (paymentMethod === "Credit" && selectedCustomer !== "walk-in") {
      const cust = customers.find(c => c.id === selectedCustomer);
      if (cust) {
        localDB.customers.update(cust.id, {
          current_balance: (cust.current_balance || 0) + total
        });
      }
    } else {
      // Add to Cashbook (If Cash/Bank)
      localDB.cashbook.create({
        organization_id: organizationId,
        transaction_type: "IN",
        category: "Sale",
        description: `POS Sale - ${paymentMethod}`,
        reference_id: sale.id,
        amount: total,
        date: now()
      });
    }

    // 5. Record Discount Request (if any)
    if (discount > 0 && user) {
      localDB.discountRequests.create({
        organization_id: organizationId,
        sale_id: sale.id,
        requested_by: user.id,
        amount: discountAmount,
        status: "Approved"
      });
    }

    // 6. Audit Log
    localDB.auditLogs.create({
      organization_id: organizationId,
      user_id: user?.id || "unknown",
      action: "Created POS Sale",
      table_affected: "Sales",
      record_id: sale.id,
      timestamp: now()
    });

    setLastSale({ ...sale, items: itemsData, invoice_number: `INV-${Date.now().toString().slice(-6)}` });
    setCart([]);
    setDiscount(0);
    setIsReceiptDialogOpen(true);
    
    // Refresh batches state
    setBatches(localDB.productBatches.getByOrganizationId(organizationId));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmt = (subtotal * discount) / 100;
  const total = subtotal - discountAmt;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-[#0aa9ad]" />
            Enterprise POS
          </h1>
          <p className="text-sm text-slate-500">Fast sales processing, barcode scanning & receipt printing</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <ScanLine className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Scan Barcode (Enter)"
              className="pl-9 w-64 rounded-xl border-slate-200"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={handleBarcodeScan}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Left Side: Products Grid */}
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-sm rounded-2xl h-[calc(100vh-200px)] flex flex-col">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-2xl pb-4">
              <CardTitle className="text-base font-semibold">Available Product Batches</CardTitle>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {availableItems.map(item => (
                  <div 
                    key={item.id} 
                    className="border border-slate-200 rounded-xl p-4 hover:border-[#0aa9ad] hover:shadow-md cursor-pointer transition flex flex-col bg-white relative overflow-hidden"
                    onClick={() => addToCart(item)}
                  >
                    <Badge variant="outline" className="w-fit mb-2 text-[10px] bg-slate-50 text-slate-500">{item.category_name}</Badge>
                    <h3 className="font-bold text-slate-900 leading-tight mb-1">{item.product_name}</h3>
                    <p className="text-xs text-slate-500 mb-3">Batch: {item.batch_number}</p>
                    <div className="mt-auto flex justify-between items-end">
                      <span className="text-lg font-black text-[#0aa9ad]">{item.selling_price.toLocaleString()} <span className="text-xs text-slate-500 font-normal">RWF</span></span>
                      <span className="text-xs font-bold px-2 py-1 rounded-md bg-emerald-100 text-emerald-700">
                        {item.quantity_remaining} left
                      </span>
                    </div>
                  </div>
                ))}
                {availableItems.length === 0 && (
                  <div className="col-span-full h-full flex flex-col items-center justify-center text-slate-400 p-8">
                    <ShoppingCart className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg font-semibold text-slate-600">No Inventory Available</p>
                    <p className="text-sm">Please add product batches in the Inventory section first.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Cart & Checkout */}
        <div className="flex flex-col h-[calc(100vh-200px)]">
          <Card className="border-slate-200 shadow-sm rounded-2xl flex-1 flex flex-col">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-2xl pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Current Sale</CardTitle>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">{cart.length} items</Badge>
            </CardHeader>
            
            {/* Customer Selection */}
            <div className="p-4 border-b border-slate-100 space-y-3">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-slate-500" />
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger className="h-9 w-full text-sm rounded-lg border-slate-200">
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <CardContent className="p-0 overflow-y-auto flex-1 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                  <ShoppingCart className="h-12 w-12 mb-4 text-slate-200" />
                  <p>Cart is empty</p>
                  <p className="text-xs mt-1">Scan items or click products to add</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 p-2">
                  {cart.map(item => (
                    <div key={item.id} className="p-3 hover:bg-slate-50 rounded-lg group">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-slate-900 text-sm line-clamp-1">{item.name}</p>
                        <p className="font-bold text-slate-900 text-sm whitespace-nowrap ml-2">{(item.price * item.quantity).toLocaleString()} RWF</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500">{item.price.toLocaleString()} RWF each</p>
                        <div className="flex items-center gap-1 border border-slate-200 rounded-md bg-white">
                          <Button size="icon" variant="ghost" className="h-7 w-7 rounded-none" onClick={() => updateQuantity(item.id, -1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                          <Button size="icon" variant="ghost" className="h-7 w-7 rounded-none" onClick={() => updateQuantity(item.id, 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            {/* Checkout Footer */}
            <div className="border-t border-slate-200 bg-slate-50/80 rounded-b-2xl p-4 space-y-4">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{subtotal.toLocaleString()} RWF</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({discount}%)</span>
                    <span>-{discountAmt.toLocaleString()} RWF</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center text-xl font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span className="text-[#0aa9ad]">{total.toLocaleString()} RWF</span>
              </div>

              <div className="flex gap-2">
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="w-[140px] h-10 border-slate-200 font-semibold bg-white">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="MoMo">Mobile Money</SelectItem>
                    <SelectItem value="Bank">Bank Transfer</SelectItem>
                    <SelectItem value="Credit">Credit Sale</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  className="flex-1 h-10 border-slate-200 text-slate-600 font-semibold bg-white hover:bg-slate-50"
                  onClick={() => setIsDiscountDialogOpen(true)}
                  disabled={cart.length === 0}
                >
                  <Percent className="w-4 h-4 mr-1" /> Disc.
                </Button>
              </div>

              <Button 
                className="w-full h-12 bg-[#09111f] hover:bg-slate-800 text-white font-bold text-lg rounded-xl shadow-lg shadow-slate-900/10" 
                onClick={checkout}
                disabled={cart.length === 0}
              >
                Checkout & Print Receipt
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Discount Approval Modal */}
      <Dialog open={isDiscountDialogOpen} onOpenChange={setIsDiscountDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manager Discount Approval</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-slate-500">Enter manager approval code to apply a 10% discount to this sale.</p>
            <Input 
              type="password" 
              placeholder="Approval Code (use: MGR123)" 
              value={discountCode}
              onChange={e => setDiscountCode(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDiscountDialogOpen(false)}>Cancel</Button>
            <Button className="bg-[#0aa9ad]" onClick={applyDiscount}>Approve Discount</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="text-center pb-2 border-b border-dashed border-slate-300">
            <DialogTitle className="text-xl font-black">SALES RECEIPT</DialogTitle>
            <p className="text-xs text-slate-500">MEDICARE ONE</p>
          </DialogHeader>
          {lastSale && (
            <div className="py-4 space-y-4 font-mono text-xs text-slate-700">
              <div className="flex justify-between">
                <span>Receipt:</span>
                <span>{lastSale.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(lastSale.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{selectedCustomer === "walk-in" ? "Walk-in" : customers.find(c => c.id === selectedCustomer)?.name}</span>
              </div>
              <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-2">
                <div className="font-bold flex justify-between">
                  <span>Item</span>
                  <span>Amount</span>
                </div>
                {lastSale.items.map((i: any, idx: number) => {
                   const cartRef = cart.find(c => c.product_id === i.product_id);
                   const name = cartRef ? cartRef.name : `Product ${i.product_id.slice(0,4)}`;
                   return (
                    <div key={idx} className="flex justify-between">
                      <span>{i.quantity}x {name.substring(0, 15)}</span>
                      <span>{i.subtotal.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{lastSale.subtotal.toLocaleString()}</span>
                </div>
                {lastSale.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-{lastSale.discount_amount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm">
                  <span>TOTAL (RWF):</span>
                  <span>{lastSale.total_amount.toLocaleString()}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-500">
                <p>Payment: {lastSale.payment_method}</p>
                <p className="mt-2 font-bold">THANK YOU FOR YOUR BUSINESS</p>
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-center">
            <Button className="w-full bg-[#09111f]" onClick={() => setIsReceiptDialogOpen(false)}>
              <Printer className="w-4 h-4 mr-2" /> Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

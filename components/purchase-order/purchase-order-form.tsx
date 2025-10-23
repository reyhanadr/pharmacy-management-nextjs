'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Search, PackagePlus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  getProducts,
  getSuppliers,
  createPurchaseOrder,
  type Product,
  type Supplier,
  type PurchaseOrderItem
} from './purchase-order-action';
import { GoodsReceivedDialog } from './goods-received-dialog';
import { AddProductModal } from '@/components/inventory/inventory-add-modal';
import { AddSupplierModal } from '@/components/supplier/supplier-add-modal';
import type { UserProfile } from '@/components/auth/auth.action';
interface PurchaseOrderFormProps {
  userData: UserProfile;
  onSuccess?: () => void;
}

export function PurchaseOrderForm({ userData, onSuccess }: PurchaseOrderFormProps) {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);

  useEffect(() => {
    loadSuppliers();
    loadProducts();
  }, []);

  // Filter products when supplier or search term changes
  useEffect(() => {
    if (selectedSupplier) {
      loadProducts(parseInt(selectedSupplier));
    } else {
      setProducts([]);
    }
  }, [selectedSupplier]);

  const loadSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load suppliers');
    }
  };

  const loadProducts = async (supplierId?: number) => {
    try {
      const data = await getProducts(supplierId);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    }
  };

  const handleProductAdded = () => {
    // Refresh products after adding new product
    if (selectedSupplier) {
      loadProducts(parseInt(selectedSupplier));
    }
  };

  const handleSupplierAdded = () => {
    // Refresh suppliers after adding new supplier
    loadSuppliers();
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItem = (product: Product) => {
    const existingItemIndex = items.findIndex(item => item.product_id === product.id);

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].total =
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].price_buy;
      setItems(updatedItems);
    } else {
      // Add new item
      const newItem: PurchaseOrderItem = {
        product_id: product.id,
        product_name: product.name,
        product_code: product.code,
        quantity: 1,
        price_buy: product.price_buy,
        total: product.price_buy,
      };
      setItems([...items, newItem]);
    }
  };

  const updateItem = (index: number, field: keyof PurchaseOrderItem, value: number | string) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Recalculate total if quantity or price changed
    if (field === 'quantity' || field === 'price_buy') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].price_buy;
    }

    setItems(updatedItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSupplier || items.length === 0) {
      setError('Pilih supplier dan tambahkan minimal satu item');
      return;
    }

    // Show confirmation dialog instead of directly creating the order
    setShowConfirmDialog(true);
  };

  const handleConfirmOrder = async (goodsReceived: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current user ID from Supabase auth
      if (!userData) {
        throw new Error('Anda harus masuk untuk membuat purchase order');
      }

      await createPurchaseOrder(
        parseInt(selectedSupplier),
        items,
        userData.id,
        goodsReceived
      );

      // Reset form
      setSelectedSupplier('');
      setItems([]);
      setSearchTerm('');

      // Redirect to purchase history page
      router.push('/supplier/manage-purchase-order');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create purchase order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Buat Purchase Order Baru</CardTitle>
          <CardDescription>
            Pilih supplier terlebih dahulu, kemudian pilih produk dari supplier tersebut. Jika belum ada supplier, tambahkan supplier baru. Jika supplier belum memiliki produk, tambahkan produk terlebih dahulu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Supplier Selection */}
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <div className="flex gap-1 items-center">
                  <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddSupplierModal(true)}
                  className="cursor-pointer"
                >
                  <UserPlus className="h-4 w-4"/>
                </Button>
              </div>
            </div> 

            {/* Product Search and Selection */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className='mb-2' htmlFor="search">Cari Produk</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Cari nama atau kode produk..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Product List */}
              <div className="border rounded-md max-h-48 overflow-y-auto">
                <div className="p-4 space-y-2">
                  {selectedSupplier ? (
                    <>
                      {/* Product List */}
                      {filteredProducts.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center mt-4">
                          Belum ada produk dari supplier: {suppliers.find(s => s.id === parseInt(selectedSupplier))?.name}
                        </p>
                      ) : (
                        filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <div className="flex-1">
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Code: {product.code} | Stock: {product.stock} | Buy Price: Rp {product.price_buy.toLocaleString()}
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => addItem(product)}
                              className="ml-2 cursor-pointer"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}

                      {/* Add Product Button - Always show when supplier is selected */}
                      <div className="pb-3 pt-3 flex justify-center">
                        <Button
                          type="button"
                          onClick={() => setShowAddProductModal(true)}
                          variant="outline"
                          className='cursor-pointer'
                        >
                          <PackagePlus className="h-4 w-4" />
                          Tambah Produk Baru
                        </Button>
                      </div>
                    </>
                    ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Pilih Supplier Terlebih Dahulu
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            {items.length > 0 && (
              <div className="space-y-4">
                <Label>Item Pesanan</Label>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-left">Produk</TableHead>
                        <TableHead className="text-left">Kode</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Harga</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.product_name}</TableCell>
                          <TableCell>{item.product_code}</TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-20 text-center"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price_buy}
                              onChange={(e) => updateItem(index, 'price_buy', parseFloat(e.target.value) || 0)}
                              className="w-24 text-right"
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            Rp {item.total.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Total */}
                <div className="flex justify-end">
                  <div className="text-lg font-semibold">
                    Total: Rp {calculateTotal().toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button className='cursor-pointer' type="submit" disabled={isLoading || !selectedSupplier || items.length === 0}>
                {isLoading ? 'Membuat...' : 'Buat Purchase Order'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <GoodsReceivedDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmOrder}
        totalAmount={calculateTotal()}
        itemCount={items.length}
      />

      {/* Add Product Modal */}
      <AddProductModal
        open={showAddProductModal}
        onOpenChange={setShowAddProductModal}
        onProductAdded={handleProductAdded}
      />

      {/* Add Supplier Modal */}
      <AddSupplierModal
        open={showAddSupplierModal}
        onOpenChange={setShowAddSupplierModal}
        onSupplierAdded={handleSupplierAdded}
      />
    </div>
  );
}

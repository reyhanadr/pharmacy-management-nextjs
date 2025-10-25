import { Table } from '@tanstack/react-table';
import { Product } from './inventory-action';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InventoryRowActions } from './inventory-row-actions';

interface MobileCardViewProps {
  table: Table<Product>;
  handleViewProduct: (id: number) => void;
  handleEditProduct: (id: number) => void;
  handleDeleteProduct: (id: number) => void;
}

interface MobilePaginationProps {
  table: Table<Product>;
}

export const MobileCardView = ({ table, handleViewProduct, handleEditProduct, handleDeleteProduct }: MobileCardViewProps) => {
  // Kode Mobile Card View dari line 310-397, tapi dengan props yang di-pass
  return (
      <div className="md:hidden space-y-4">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <div
              key={row.id}
              className={`border rounded-lg p-4 space-y-3 cursor-pointer hover:bg-muted/50 transition-colors focus-within:bg-muted/50 ${
                row.getIsSelected() ? 'bg-muted' : ''
              }`}
              onClick={() => handleViewProduct(row.original.id)}
              role="button"
              tabIndex={0}
              aria-label={`Klik untuk melihat detail produk ${row.getValue("name")}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleViewProduct(row.original.id)
                }
              }}
            >
              {/* Mobile Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Pilih ${row.getValue("name")}`}
                  />
                  <span className="font-medium text-sm">
                    {row.getValue("name")}
                  </span>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <InventoryRowActions
                    product={row.original}
                    onDetail={() => handleViewProduct(row.original.id)}
                    onEdit={() => handleEditProduct(row.original.id)}
                    onDelete={() => handleDeleteProduct(row.original.id)}
                  />
                </div>
              </div>

              {/* Mobile Card Content */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Kode:</span>
                  <p className="font-medium">{row.getValue("code")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Kategori:</span>
                  <p>{row.getValue("category") || "Tidak ada kategori"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Stok:</span>
                  <p className={(row.getValue("stock") as number) < 10 ? "text-red-600 font-medium" : ""}>
                    {row.getValue("stock")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Supplier:</span>
                  <p>{row.getValue("supplier_name") || "Tidak ada supplier"}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Tanggal Ditambah:</span>
                  <p>{new Date(row.getValue("created_at")).toLocaleDateString("id-ID")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Harga Beli:</span>
                  <p>
                    Rp {new Intl.NumberFormat("id-ID").format(row.getValue("price_buy") as number)}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Harga Jual:</span>
                  <p>
                    Rp {new Intl.NumberFormat("id-ID").format(row.getValue("price_sell") as number)}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada data produk.
          </div>
        )}
      </div>
  );
};

export const MobilePagination = ({ table }: MobilePaginationProps) => {
  // Kode pagination mobile dari line 427-451
  return (
      <div className="md:hidden flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} dari{" "}
          {table.getFilteredRowModel().rows.length} dipilih
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ‹
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            ›
          </Button>
        </div>
      </div>
  );
};
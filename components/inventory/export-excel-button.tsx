'use client'

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { Product } from "./inventory-action"
import * as XLSX from 'xlsx';

interface ExportExcelButtonProps {
  data: Product[];
  fileName?: string;
}

export function ExportExcelButton({ data, fileName = 'data-produk' }: ExportExcelButtonProps) {
  const exportToExcel = () => {
    // Format data untuk Excel
    const excelData = data.map(product => ({
      'Kode Produk': product.code,
      'Nama Produk': product.name,
      'Kategori': product.category || '-',
      'Stok': product.stock,
      'Harga Beli': product.price_buy,
      'Harga Jual': product.price_sell,
      'Supplier': product.supplier_name || '-',
      'Tanggal Dibuat': new Date(product.created_at).toLocaleDateString('id-ID'),
      'Terakhir Diperbarui': new Date(product.updated_at).toLocaleDateString('id-ID')
    }));

    // Buat worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Atur lebar kolom
    const wscols = [
      { wch: 15 }, // Kode Produk
      { wch: 30 }, // Nama Produk
      { wch: 20 }, // Kategori
      { wch: 10 }, // Stok
      { wch: 15 }, // Harga Beli
      { wch: 15 }, // Harga Jual
      { wch: 25 }, // Supplier
      { wch: 15 }, // Tanggal Dibuat
      { wch: 20 }, // Terakhir Diperbarui
    ];
    ws['!cols'] = wscols;

    // Buat workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Produk');

    // Generate nama file dengan tanggal
    const date = new Date().toISOString().split('T')[0];
    const exportFileName = `${fileName}-${date}.xlsx`;

    // Download file
    XLSX.writeFile(wb, exportFileName);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="flex-1 sm:flex-initial cursor-pointer"
      onClick={exportToExcel}
    >
      <Download className="mr-1 h-4 w-4" />
      <span className="hidden sm:inline">Export Excel</span>
    </Button>
  );
}

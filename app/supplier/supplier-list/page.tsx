import { SupplierListPageClient } from "./supplier-list-client"
import { getSuppliers } from "@/components/supplier/supplier-action"

export default async function SupplierListPage() {
  const suppliers = await getSuppliers()

  return (
    <SupplierListPageClient initialSuppliers={suppliers} />
  )
}
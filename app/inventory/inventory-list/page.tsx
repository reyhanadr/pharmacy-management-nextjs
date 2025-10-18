import { InventoryListPageClient } from "./inventory-list-client"
import { getProducts } from "@/components/inventory/inventory-list-action"

export default async function InventoryListPage() {
  const products = await getProducts()

  return (
    <InventoryListPageClient initialProducts={products} />
  )
}
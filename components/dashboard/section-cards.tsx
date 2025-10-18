import { TrendingDown, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Penjualan</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums sm:text-2xl @[250px]/card:text-3xl break-all sm:break-normal">
            Rp 45jt
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-600 border-green-600">
              <TrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Tren naik bulan ini <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Penjualan selama 6 bulan terakhir
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Resep</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums sm:text-2xl @[250px]/card:text-3xl">
            2,847
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-600 border-green-600">
              <TrendingUp />
              +15.3%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Peningkatan signifikan bulan ini <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Jumlah resep yang dilayani bulan ini
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Barang Aktif</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums sm:text-2xl @[250px]/card:text-3xl">
            1,247
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-600 border-green-600">
              <TrendingUp />
              +5.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Retensi inventory kuat <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Manajemen stok melebihi target
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tingkat Pertumbuhan</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums sm:text-2xl @[250px]/card:text-3xl">
            8.5%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-red-600 border-red-600">
              <TrendingDown />
              -2.1%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Peningkatan performa stabil <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Memenuhi proyeksi pertumbuhan
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

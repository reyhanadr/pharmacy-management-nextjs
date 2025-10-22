
import { ShieldOff, ShieldCheck } from 'lucide-react'


export function UserBanStatusBadge({ isBanned }: { isBanned: boolean }) {
  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${
      isBanned
        ? 'bg-red-100 text-red-800 border-red-300'
        : 'bg-green-100 text-green-800 border-green-300'
    }`}>
      {isBanned ? <ShieldOff className="w-3 h-3 mr-1" /> : <ShieldCheck className="w-3 h-3 mr-1" />}
      {isBanned ? 'Dibanned' : 'Aktif'}
    </span>
  )
}
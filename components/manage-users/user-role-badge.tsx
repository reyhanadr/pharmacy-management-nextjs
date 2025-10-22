
import { Shield, UserIcon } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

export function UserRoleBadge({ role }: { role: 'owner' | 'pegawai' }) {
  const roleConfig = {
    owner: {
      label: 'Owner',
      className: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: <Shield className="w-4 h-4" />
    },
    pegawai: {
      label: 'Pegawai',
      className: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: <UserIcon className="w-4 h-4" />
    }
  }

  const config = roleConfig[role]

  return (
    <Badge variant="outline" className={config.className}>
      {config.icon}
      <span className="ml-1">{config.label}</span>
    </Badge>
  )
}
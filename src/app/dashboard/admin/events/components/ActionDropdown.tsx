import { 
  Eye, 
  Edit, 
  Users, 
  BarChart3, 
  CalendarRange, 
  Clock4, 
  UserCog, 
  Copy, 
  Trash2, 
  MoreVertical 
} from "lucide-react"

interface ActionDropdownProps {
  event: any
  onAction: (event: any, action: string) => void
  isOpen: boolean
  onToggle: () => void
}

export default function ActionDropdown({ event, onAction, isOpen, onToggle }: ActionDropdownProps) {
  const actionGroups = [
    {
      name: "View & Edit",
      actions: [
        { id: 'view_details', label: 'View Details', icon: Eye, color: 'text-blue-600' },
        { id: 'edit_event', label: 'Edit Event', icon: Edit, color: 'text-green-600' }
      ]
    },
    {
      name: "Management",
      actions: [
        { id: 'manage_attendees', label: 'Manage Attendees', icon: Users, color: 'text-purple-600' },
        { id: 'statistics', label: 'View Statistics', icon: BarChart3, color: 'text-orange-600' }
      ]
    },
    {
      name: "Date & Time",
      actions: [
        { id: 'extend_date', label: 'Extend Date', icon: CalendarRange, color: 'text-indigo-600' },
        { id: 'postpone', label: 'Postpone Event', icon: Clock4, color: 'text-yellow-600' },
        { id: 'close_event', label: 'Close Event', icon: Clock4, color: 'text-red-600' }
      ]
    },
    {
      name: "Administration",
      actions: [
        { id: 'transfer_ownership', label: 'Transfer Ownership', icon: UserCog, color: 'text-pink-600' },
        { id: 'duplicate', label: 'Duplicate Event', icon: Copy, color: 'text-teal-600' }
      ]
    },
    {
      name: "Danger Zone",
      actions: [
        { id: 'cancel_event', label: 'Cancel Event', icon: Trash2, color: 'text-red-600' },
        { id: 'cancel_permanently', label: 'Cancel Permanently', icon: Trash2, color: 'text-red-600' },
        { id: 'delete_event', label: 'Delete Event', icon: Trash2, color: 'text-red-600' }
      ]
    }
  ]

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-4 h-4 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 py-2">
          {actionGroups.map((group, groupIndex) => (
            <div key={group.name}>
              {groupIndex > 0 && <div className="border-t border-gray-200 my-2"></div>}
              <div className="px-3 py-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {group.name}
                </p>
              </div>
              {group.actions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      onAction(event, action.id)
                      onToggle()
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Icon className={`w-4 h-4 ${action.color}`} />
                    <span>{action.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
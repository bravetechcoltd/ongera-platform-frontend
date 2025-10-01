import { Community } from "@/lib/features/auth/communitiesSlice"
import CommunityCard from "./CommunityCard"

interface CommunityGridProps {
  communities: Community[]
}

export default function CommunityGrid({ communities }: CommunityGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {communities.map((community) => (
        <CommunityCard key={community.id} community={community} />
      ))}
    </div>
  )
}

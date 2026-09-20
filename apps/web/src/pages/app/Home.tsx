import { useOutletContext } from "react-router-dom"
import { PostFeed } from "../../components/feed/PostFeed"
import { RightSidebar } from "../../components/layout/RightSidebar"

export function Home() {
  const { user } = useOutletContext<{ user: any }>()

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      <PostFeed user={user} />
      <RightSidebar />
    </div>
  )
}

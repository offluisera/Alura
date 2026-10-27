import { usePinnedServersContext } from '../../contexts/PinnedServersContext'
export type { PinnedServer } from '../../contexts/PinnedServersContext'

export function usePinnedServers(_userId?: string) {
  return usePinnedServersContext()
}

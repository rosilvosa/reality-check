import { create } from 'zustand'
import { watchRoomStats, type RoomStats } from '../lib/room'

interface RoomState {
  room: RoomStats | null
  roomLoaded: boolean
}

export const useRoomStore = create<RoomState>(() => ({
  room: null,
  roomLoaded: false,
}))

/**
 * Subscribed once, for the tab's lifetime, not tied to whether Home happens
 * to be mounted right now. Home used to own this subscription in its own
 * component state (useState + useEffect), which meant the subscription --
 * and the loading skeleton while it was pending -- reset every single time
 * you navigated away from Home and back, not just once per session. A
 * Zustand store is a module-level singleton, so this runs exactly once no
 * matter how many times a component that reads it mounts and unmounts,
 * matching how streakStore already behaves for the same reason.
 */
watchRoomStats((r) => useRoomStore.setState({ room: r, roomLoaded: true }))

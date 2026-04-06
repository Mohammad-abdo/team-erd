import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSessionStore } from '../../store/useSessionStore'

describe('useSessionStore', () => {
  it('has correct initial state', () => {
    const { result } = renderHook(() => useSessionStore())
    
    expect(result.current.user).toBeNull()
    expect(result.current.hydrated).toBe(false)
  })

  it('setUser updates the user state', () => {
    const { result } = renderHook(() => useSessionStore())
    
    const testUser = { id: '1', email: 'test@example.com', name: 'Test User' }
    
    act(() => {
      result.current.setUser(testUser)
    })
    
    expect(result.current.user).toEqual(testUser)
  })

  it('setHydrated updates the hydrated state', () => {
    const { result } = renderHook(() => useSessionStore())
    
    expect(result.current.hydrated).toBe(false)
    
    act(() => {
      result.current.setHydrated(true)
    })
    
    expect(result.current.hydrated).toBe(true)
  })

  it('clearSession resets user but keeps hydrated true', () => {
    const { result } = renderHook(() => useSessionStore())
    
    const testUser = { id: '1', email: 'test@example.com' }
    
    act(() => {
      result.current.setUser(testUser)
      result.current.setHydrated(true)
    })
    
    expect(result.current.user).toEqual(testUser)
    expect(result.current.hydrated).toBe(true)
    
    act(() => {
      result.current.clearSession()
    })
    
    expect(result.current.user).toBeNull()
    expect(result.current.hydrated).toBe(true)
  })

  it('can update user multiple times', () => {
    const { result } = renderHook(() => useSessionStore())
    
    const user1 = { id: '1', email: 'user1@example.com' }
    const user2 = { id: '2', email: 'user2@example.com' }
    
    act(() => {
      result.current.setUser(user1)
    })
    expect(result.current.user).toEqual(user1)
    
    act(() => {
      result.current.setUser(user2)
    })
    expect(result.current.user).toEqual(user2)
    
    act(() => {
      result.current.setUser(null)
    })
    expect(result.current.user).toBeNull()
  })
})

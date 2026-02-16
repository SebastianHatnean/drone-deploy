/**
 * User types for the drone fleet application.
 */
export type UserType = 'admin' | 'driver' | 'client'

export interface User {
  id: string
  name: string
  type: UserType
  email?: string
}

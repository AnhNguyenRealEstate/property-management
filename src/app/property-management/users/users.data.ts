export interface UserProfile {
    roles: Role[]
    userName: string
    displayName: string
}

export type Role = 'owner' | 'customer-service' | 'admin';
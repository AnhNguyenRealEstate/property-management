import { Timestamp } from "@angular/fire/firestore"

export interface ExtensionData {
    ownerName?: string
    tenantName?: string
    startDate?: Timestamp
    endDate?: Timestamp
    propertyId?: string
}
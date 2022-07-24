import { Timestamp } from "@angular/fire/firestore"

export interface Property {
    name?: string
    id?: string //Firebase auto generated
    address?: string
    description?: string
    category?: string
    subcategory?: string
    managementStartDate?: Timestamp
    managementEndDate?: Timestamp
    fileStoragePath?: string
    documents?: UploadedFile[]
    creationDate?: Timestamp
    ownerUsername?: string
    owner?: Owner
    rentalPrice?: number
    customerServiceReps?: CustomerServiceRep[]
}

export interface CustomerServiceRep {
    username?: string
}

export interface Owner {
    contactName?: string
    contactInfo?: string
    username?: string
    dateOfLastContact?: Timestamp
}
export interface Activity {
    date?: Timestamp
    description?: string
    documents?: UploadedFile[]
    id?: string //Firebase auto generated
    owner?: string
    propertyId?: string
    propertyName?: string
}

export interface UploadedFile {
    dbHashedName?: string
    displayName?: string
    date?: Timestamp
}
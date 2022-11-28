import { Timestamp } from "@angular/fire/firestore"

export interface UploadedFile {
    dbHashedName?: string
    displayName?: string
    date?: Timestamp
}
import { Timestamp } from "@angular/fire/firestore"
import { Role } from "../shared/user-profile.service"

export interface UploadedFile {
    dbHashedName?: string
    displayName?: string
    date?: Timestamp
}
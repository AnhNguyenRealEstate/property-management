import { Timestamp } from "@angular/fire/firestore"
import { Role } from "../shared/roles.service"

export interface UploadedFile {
    dbHashedName?: string
    displayName?: string
    date?: Timestamp
}

export interface User {
    roles?: Role[]
    displayName?: string
    userName?: string
}   
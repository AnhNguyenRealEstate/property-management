import { Timestamp } from "@angular/fire/firestore";
import { UploadedFile } from "../property-management.data";


export interface Activity {
    date?: Timestamp
    description?: string
    documents?: UploadedFile[]
    id?: string //Firebase auto generated
    owner?: string
    propertyId?: string
    propertyName?: string
    fileStoragePath?: string //Firebase auto generated
}

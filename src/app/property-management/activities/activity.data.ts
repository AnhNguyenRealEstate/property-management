import { Timestamp } from "@angular/fire/firestore";
import { PropertyCategory } from "../properties/property.data";
import { UploadedFile } from "../property-management.data";
import { UserProfile } from "../users/users.data";

export type ActivityType = 'generic' | 'newContract' | 'contractExtension' | 'contractCancellation' | 'propertyEdit' | 'invoice';

export interface Activity {
    date?: Timestamp
    description?: string
    documents?: UploadedFile[]
    id?: string //Firebase auto generated
    owner?: string
    propertyId?: string
    propertyName?: string
    propertyCategory?: PropertyCategory
    fileStoragePath?: string //Firebase auto generated
    type?: ActivityType
    createdBy?: UserProfile
}

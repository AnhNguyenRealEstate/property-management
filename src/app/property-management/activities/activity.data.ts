import { Timestamp } from "@angular/fire/firestore";
import { UserProfile } from "src/app/shared/user-profile.service";
import { PropertyCategory } from "../properties/property.data";
import { UploadedFile } from "../property-management.data";

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

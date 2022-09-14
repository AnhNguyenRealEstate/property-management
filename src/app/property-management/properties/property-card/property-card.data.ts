import { Timestamp } from "@angular/fire/firestore";
import { Owner } from "../../owners/owners-view/owner.data";
import { UploadedFile } from "../../property-management.data";

export type PropertyCategory = 'Apartment' | 'Villa' | 'Townhouse' | 'Commercial';
export interface Property {
    name?: string;
    id?: string; //Firebase auto generated
    address?: string;
    description?: string;
    category?: PropertyCategory;
    subcategory?: string;
    managementStartDate?: Timestamp;
    managementEndDate?: Timestamp;
    fileStoragePath?: string;
    documents?: UploadedFile[];
    creationDate?: Timestamp;
    ownerUsername?: string;
    owner?: Owner;
    rentalPrice?: string;
    lastModifiedBy?: string;
}


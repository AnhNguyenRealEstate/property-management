import { Timestamp } from "@angular/fire/firestore";
import { UploadedFile } from "../property-management.data";
import { Owner } from "../owners-view/owner.data";


export interface Property {
    name?: string;
    id?: string; //Firebase auto generated
    address?: string;
    description?: string;
    category?: string;
    subcategory?: string;
    managementStartDate?: Timestamp;
    managementEndDate?: Timestamp;
    fileStoragePath?: string;
    documents?: UploadedFile[];
    creationDate?: Timestamp;
    ownerUsername?: string;
    owner?: Owner;
    rentalPrice?: number;
}

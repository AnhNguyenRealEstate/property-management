import { Timestamp } from "@angular/fire/firestore";


export interface Owner {
    contactName?: string;
    contactInfo?: string;
    username?: string;
    dateOfLastContact?: Timestamp;
    propertyIDs?: string[]; //Firebase IDs of properties under this owner
    id?: string; //Firebase Id
}

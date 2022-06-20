import { Component, OnInit } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Property } from "../property-management.data";
import { PropertyUploadComponent } from "../property-upload/property-upload.component";
import { RolesService } from "../shared/roles.service";

@Component({
    selector: 'app-layout',
    templateUrl: 'layout.component.html',
    styleUrls: ['./layout.component.scss']
})

export class LayoutComponent implements OnInit {
    constructor(
        private dialog: MatDialog,
        public roles: RolesService,
        private router: Router) {
    }

    ngOnInit(): void {
        this.router.navigateByUrl('/property-management/(property-management-outlet:summary-view)');
    }

    viewSummary() {
        this.router.navigateByUrl('/property-management/(property-management-outlet:summary-view)');
    }

    viewProperties() {
        this.router.navigateByUrl('/property-management/(property-management-outlet:properties-view)');
    }

    viewActivities() {
        this.router.navigateByUrl('/property-management/(property-management-outlet:activities)');
    }

    async addProperty() {
        const config = {
            height: '90%',
            width: '100%',
            autoFocus: false,
            data: {
                property: {} as Property,
                isEditMode: false
            }
        } as MatDialogConfig;

        this.dialog.open(PropertyUploadComponent, config);
    }
}
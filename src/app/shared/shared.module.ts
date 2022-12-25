import { CurrencyPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectConfig, MatSelectModule, MAT_SELECT_CONFIG } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgxTrimDirectiveModule } from 'ngx-trim-directive';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AutoFocusDirective } from './auto-focus-on-error.directive';

@NgModule({
    declarations: [AutoFocusDirective],
    exports: [
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatToolbarModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatInputModule,
        MatSliderModule,
        MatDividerModule,
        MatListModule,
        MatCardModule,
        MatDialogModule,
        MatSnackBarModule,
        MatMenuModule,
        NgxTrimDirectiveModule,
        MatTooltipModule,
        MatTabsModule,
        MatDatepickerModule,
        MatProgressSpinnerModule,
        DragDropModule,
        AutoFocusDirective
    ],
    providers: [
        CurrencyPipe,
        {
            provide: MAT_SELECT_CONFIG,
            useValue: {
                disableOptionCentering: true
            } as MatSelectConfig
        }
    ]
})
export class SharedModule { }

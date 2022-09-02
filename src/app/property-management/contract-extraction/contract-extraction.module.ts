import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';

import { ContractExtractionComponent } from './contract-extraction.component';

@NgModule({
    declarations: [ContractExtractionComponent],
    imports: [
        CommonModule,
        SharedModule
    ],
    exports: [ContractExtractionComponent]
})
export class ContractExtractionModule { }

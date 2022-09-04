import { Component, HostListener, OnInit } from '@angular/core';
import { ContractExtractionService } from './contract-extraction.service';

@Component({
    selector: 'contract-extraction',
    templateUrl: 'contract-extraction.component.html'
})

export class ContractExtractionComponent implements OnInit {
    contract!: File;
    contractType: string = 'rental';

    objectKeys = Object.keys
    results!: Object | undefined;

    constructor(
        public contractExtractor: ContractExtractionService
    ) { }

    ngOnInit() { }

    async submit() {
        const data = new FormData();
        data.append('contract_type', this.contractType);
        data.append('contract', this.contract);
        this.results = await this.contractExtractor.extract(data);
    }

    onContractUpload(event: any) {
        const files = event.target.files as FileList;
        this.contract = files[0];
    }

    @HostListener('window:keyup.Enter', ['$event'])
    onDialogClick(event: KeyboardEvent): void {
        this.submit();
    }
}
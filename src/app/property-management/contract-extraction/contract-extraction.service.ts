import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContractExtractionService {
    private endpoint = 'http://127.0.0.1:5000/extract';

    private extracting$$ = new BehaviorSubject<boolean>(false);
    extracting$ = this.extracting$$.asObservable();

    constructor(private httpClient: HttpClient) { }

    async extract(data: FormData) {
        this.extracting$$.next(true);

        try {
            const dataIsValid = data.has('contract') && data.has('contract_type')
            if (!dataIsValid) {
                return;
            }

            return await firstValueFrom(this.httpClient.post(this.endpoint, data))
        } finally {
            this.extracting$$.next(false);
        }
    }
}
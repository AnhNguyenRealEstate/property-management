import { Pipe, PipeTransform } from "@angular/core";
import { Invoice } from "../invoices.data";

@Pipe({
    name: 'invoiceFilter'
})
export class PropertyFilterPipe implements PipeTransform {
    transform(value: Invoice[], query: string): Invoice[] {
        if (!query) {
            return value;
        }

        return value.filter(invoice =>
            invoice.propertyName?.toLowerCase().indexOf(query.toLowerCase()) !== -1
            || invoice.payer?.toLowerCase().indexOf(query.toLowerCase()) !== -1
            || invoice.payee?.toLowerCase().indexOf(query.toLowerCase()) !== -1
        )
    }
}
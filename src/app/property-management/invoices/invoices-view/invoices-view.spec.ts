import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FirebaseApp, provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { Auth, provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';
import { Firestore, provideFirestore, getFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { firebaseConfig } from 'src/app/shared/globals';
import { InvoicesViewComponent, MonthpickerDateAdapter } from './invoices-view.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Platform } from '@angular/cdk/platform';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { DateAdapter } from 'angular-calendar';
import { signInWithEmailAndPassword } from '@firebase/auth';
import { NgxPrintModule } from 'ngx-print';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserTestingModule } from '@angular/platform-browser/testing';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SharedModule } from 'src/app/shared/shared.module';
import { CommonModule } from '@angular/common';

declare var require: any;

describe('Invoices View', () => {
    let firebaseApp: FirebaseApp;
    let firestore: Firestore;
    let auth: Auth;

    let component: InvoicesViewComponent
    let fixture: ComponentFixture<InvoicesViewComponent>

    beforeAll(async () => {
        await TestBed.configureTestingModule({
            declarations: [InvoicesViewComponent],
            imports: [
                CommonModule,
                provideFirebaseApp(() => {
                    firebaseApp = initializeApp(firebaseConfig);
                    return firebaseApp;
                }),
                provideFirestore(() => {
                    firestore = getFirestore(firebaseApp);
                    connectFirestoreEmulator(firestore, 'localhost', 8080);
                    return firestore;
                }),
                provideAuth(() => {
                    auth = getAuth(firebaseApp);
                    connectAuthEmulator(auth, 'http://localhost:9099');
                    return auth;
                }),
                TranslateTestingModule.withTranslations(
                    {
                        en: require('src/assets/i18n/en.json'),
                        vn: require('src/assets/i18n/vn.json')
                    }
                ),
                NoopAnimationsModule,
                NgxPrintModule,
                MatDatepickerModule,
                MatNativeDateModule
            ],
            providers: [
                {
                    provide: DateAdapter,
                    useClass: MonthpickerDateAdapter,
                    deps: [MAT_DATE_LOCALE, Platform]
                },
            ]
        }).compileComponents();

        TestBed.inject(FirebaseApp);
        TestBed.inject(Firestore);

        auth = TestBed.inject(Auth);

        fixture = TestBed.createComponent(InvoicesViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });

    it('should have editable month-picker for collected invoices', async () => {
        const tabSelector = 'mat-tab[id="collected-invoices"]';
        const calendarInputSelector = 'input[id="dpCollected"]';
        await testDateInput(tabSelector, calendarInputSelector);
    });

    it('should have editable month-picker for paid out invoices', async () => {
        const tabSelector = 'mat-tab[id="paidout-invoices"]';
        const calendarInputSelector = 'input[id="dpPaidout"]';
        await testDateInput(tabSelector, calendarInputSelector);
    });

    async function testDateInput(tabSelector: string, calendarInputSelector: string) {
        await fixture.whenStable();
        const invoicesViewEl = fixture.nativeElement as HTMLElement;
        (invoicesViewEl.querySelector(tabSelector) as HTMLElement).click();

        await fixture.whenStable();

        const today = new Date();
        const todayAsInputValue = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        const calendarInput = (fixture.nativeElement as HTMLElement).querySelector(calendarInputSelector) as HTMLInputElement;
        calendarInput.value = todayAsInputValue;
        calendarInput.dispatchEvent(new Event('input'));

        fixture.detectChanges();
        await fixture.whenStable();
        expect(calendarInput.value).toBe(todayAsInputValue);

        const sixMonthsAway = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());
        const newDateInput = `${sixMonthsAway.getFullYear()}-${sixMonthsAway.getMonth() + 1}-${sixMonthsAway.getDate()}`;
        calendarInput.value = newDateInput;
        calendarInput.dispatchEvent(new Event('input'));

        fixture.detectChanges();
        await fixture.whenStable();
        expect(calendarInput.value).toBe(newDateInput);
    }
});
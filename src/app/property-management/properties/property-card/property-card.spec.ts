import { CommonModule } from "@angular/common"
import { ComponentFixture, TestBed } from "@angular/core/testing"
import { FirebaseApp, provideFirebaseApp, initializeApp } from "@angular/fire/app"
import { Auth, provideAuth, getAuth, connectAuthEmulator } from "@angular/fire/auth"
import { Firestore, provideFirestore, getFirestore, connectFirestoreEmulator, Timestamp } from "@angular/fire/firestore"
import { NoopAnimationsModule } from "@angular/platform-browser/animations"
import { TranslateTestingModule } from "ngx-translate-testing"
import { firebaseConfig } from "src/app/shared/globals"
import { SharedModule } from "src/app/shared/shared.module"
import { Owner } from "../../owners/owner.data"
import { PropertyCardComponent } from "./property-card.component"

describe('Property Card Component', () => {
    let firebaseApp: FirebaseApp;
    let firestore: Firestore;
    let auth: Auth;

    let component: PropertyCardComponent
    let fixture: ComponentFixture<PropertyCardComponent>

    const startDate = '10';
    const startMonth = '03';
    const startYear = '2022';

    const endDate = '10';
    const endMonth = '03';
    const endYear = '2023';


    beforeAll(async () => {
        await TestBed.configureTestingModule({
            declarations: [PropertyCardComponent],
            imports: [
                CommonModule,
                SharedModule,
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
                NoopAnimationsModule
            ]
        }).compileComponents();

        TestBed.inject(FirebaseApp);
        TestBed.inject(Firestore);
        TestBed.inject(Auth);

        fixture = TestBed.createComponent(PropertyCardComponent);
        component = fixture.componentInstance;
        component.property = {
            name: 'Test property',
            id: '12345',
            address: 'Test addr',
            description: 'Test descr',
            category: 'Apartment',
            subcategory: 'Test subcat',
            managementStartDate: Timestamp.fromDate(
                new Date(Number(startYear), Number(startMonth) - 1, Number(startDate))
            ),
            managementEndDate: Timestamp.fromDate(
                new Date(Number(endYear), Number(endMonth) - 1, Number(endDate))
            ),
            fileStoragePath: '',
            documents: [],
            creationDate: Timestamp.now(),
            ownerUsername: 'Owner test',
            owner: { contactName: 'Owner test' } as Owner,
            tenantName: 'Test tenant'
        }
        fixture.detectChanges();
    })

    it('should create', () => {
        expect(component).toBeDefined();
    })

    it('should display date in the DD/MM/YYYY format', () => {
        const startDateEl = (fixture.nativeElement as HTMLElement).querySelector('[id="mgmtStartDate"]') as HTMLElement;
        expect(startDateEl).toBeDefined();
        expect(startDateEl.textContent).toBe(`${startDate}/${startMonth}/${startYear}`);

        const endDateEl = (fixture.nativeElement as HTMLElement).querySelector('[id="mgmtEndDate"]') as HTMLElement;
        expect(endDateEl).toBeDefined();
        expect(endDateEl.textContent).toBe(`${endDate}/${endMonth}/${endYear}`);
    })
})
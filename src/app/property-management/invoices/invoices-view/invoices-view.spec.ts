import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FirebaseApp, provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { Auth, provideAuth, getAuth, connectAuthEmulator, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, provideFirestore, getFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { FirebaseStorage, provideStorage, getStorage, connectStorageEmulator } from '@angular/fire/storage';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { firebaseConfig } from 'src/app/shared/globals';
import { InvoicesViewComponent } from './invoices-view.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

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
        auth = TestBed.inject(Auth);

        fixture = TestBed.createComponent(InvoicesViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });
});
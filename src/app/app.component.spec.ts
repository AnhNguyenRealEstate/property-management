import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FirebaseApp, provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { Auth, provideAuth, getAuth, connectAuthEmulator, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, provideFirestore, getFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Idle } from '@ng-idle/core';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { AppComponent } from './app.component';
import { firebaseConfig } from './shared/globals';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { SharedModule } from './shared/shared.module';

declare var require: any

describe('App Component', () => {
    let firebaseApp: FirebaseApp;
    let auth: Auth;

    let component: AppComponent
    let fixture: ComponentFixture<AppComponent>

    beforeAll(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                AppComponent
            ],
            imports: [
                RouterTestingModule,
                HttpClientModule,
                NgIdleKeepaliveModule.forRoot(),
                SharedModule,
                provideFirebaseApp(() => {
                    firebaseApp = initializeApp(firebaseConfig);
                    return firebaseApp;
                }),
                provideAuth(() => {
                    auth = getAuth(firebaseApp);
                    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
                    return auth;
                }),
                TranslateTestingModule.withTranslations(
                    {
                        en: require('src/assets/i18n/en.json'),
                        vn: require('src/assets/i18n/vn.json')
                    }
                )
            ]
        }).compileComponents();

        TestBed.inject(FirebaseApp);
        auth = TestBed.inject(Auth);

        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the app', () => {
        expect(component).toBeTruthy();
    });
});

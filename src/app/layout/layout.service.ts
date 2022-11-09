import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoginService } from '../login/login.service';

@Injectable({ providedIn: 'root' })
export class LayoutService {
    private renderer: Renderer2;
    private sub: Subscription = new Subscription();
    private highlightSideNavBtnSub: Subscription | undefined;

    constructor(
        private router: Router,
        private loginService: LoginService,
        private rendererFactory: RendererFactory2,
        @Inject(DOCUMENT) private document: Document
    ) {
        this.renderer = this.rendererFactory.createRenderer(null, null);
    }

    highlightNav() {
        this.highlightSideNavBtn(this.router.url);
    }

    init() {
        this.sub.add(this.loginService.loggedIn$.subscribe(loggedIn => {
            if (loggedIn) {
                this.highlightSideNavBtnSub = this.router.events.subscribe(event => {
                    if (event instanceof NavigationEnd) {
                        this.highlightSideNavBtn(event.url);
                    }
                });
                this.sub.add(this.highlightSideNavBtnSub);
            } else {
                this.highlightSideNavBtnSub?.unsubscribe();
            }
        }));
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    private highlightSideNavBtn(url: string) {
        if (url.includes('property-management-outlet:properties')) {
            this.raiseViewBtn(this.document.querySelector('[id="properties-btn"]'))
        } else if (url.includes('property-management-outlet:activities')) {
            this.raiseViewBtn(this.document.querySelector('[id="activities-btn"]'))
        } else if (url.includes('property-management-outlet:invoices')) {
            this.raiseViewBtn(this.document.querySelector('[id="invoices-btn"]'))
        } else if (url.includes('property-management-outlet:summary')) {
            this.raiseViewBtn(this.document.querySelector('[id="summary-btn"]'))
        }
    }

    private raiseViewBtn(target: any) {
        const classList = target.classList as DOMTokenList;
        if (classList.contains('view-nav-btn')) {
            this.document.querySelectorAll('.view-nav-btn').forEach(element => {
                this.renderer.removeClass(element, 'active-nav-btn');
            });

            this.renderer.addClass(target, 'active-nav-btn');
        } else if ((target.offsetParent.classList as DOMTokenList).contains('view-nav-btn')) {
            parent = target.offsetParent;
            this.document.querySelectorAll('.view-nav-btn').forEach(element => {
                this.renderer.removeClass(element, 'active-nav-btn');
            });

            this.renderer.addClass(parent, 'active-nav-btn');
        }
    }
}
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'any' })
export class TabSwipeService {
    private scrollDistanceX = 50;
    constructor(
        @Inject(DOCUMENT) private document: Document
    ) { }

    initSwipeDetection(tabIndex: BehaviorSubject<number>, tabCount: number) {
        let touchStartX = 0
        let touchEndX = 0

        this.document.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX
        })

        this.document.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX

            if (!(Math.abs(touchStartX - touchEndX) > this.scrollDistanceX)) {
                return
            }

            if (touchEndX < touchStartX) {
                tabIndex.next((tabIndex.getValue() + 1) % tabCount);
            } else if (touchEndX > touchStartX) {
                tabIndex.next((tabIndex.getValue() - 1) % tabCount);
            }
        })
    }
}   
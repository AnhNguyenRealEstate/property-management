import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';

@Directive({
  selector: '[appMatTabSwipe]'
})
export class MatTabSwipeDirective {

  private scrollDistanceX = window.innerWidth / 3; // one third screen width

  private touchStartX: number = 0
  private touchEndX: number = 0

  @Input() tabCount: number = 0
  @Input() tabGroup!: MatTabGroup

  constructor() {
  }

  @HostListener('touchstart', ['$event']) onTouchStart(e: TouchEvent) {
    this.touchStartX = e.changedTouches[0].screenX
  }

  @HostListener('touchend', ['$event']) onTouchEnd(e: TouchEvent) {
    this.touchEndX = e.changedTouches[0].screenX

    if (!(Math.abs(this.touchStartX - this.touchEndX) > this.scrollDistanceX)) {
      return
    }

    const currentTabIdx = this.tabGroup.selectedIndex || 0

    if (this.touchEndX < this.touchStartX && currentTabIdx < this.tabCount - 1) {
      this.tabGroup.selectedIndex = (currentTabIdx + 1) % this.tabCount
    } else if (this.touchEndX > this.touchStartX && currentTabIdx > 0) {
      this.tabGroup.selectedIndex = (currentTabIdx - 1) % this.tabCount
    }
  }
}

import { Directive, ElementRef, inject, input, signal } from '@angular/core';

/**
 * Rend l'élément hôte déplaçable à la souris / au doigt.
 * Seule la zone correspondant à `dragHandle` (sélecteur CSS) déclenche le déplacement,
 * comme la barre de titre d'une fenêtre.
 */
@Directive({
  selector: '[appDraggable]',
  host: {
    '[style.transform]': '`translate(${offset().x}px, ${offset().y}px)`',
    '[class.dragging]': 'dragging()',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'onPointerUp($event)',
  },
})
export class DraggableDirective {
  readonly dragHandle = input('.title-bar');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly offset = signal({ x: 0, y: 0 });
  protected readonly dragging = signal(false);
  private start = { x: 0, y: 0 };

  protected onPointerDown(event: PointerEvent): void {
    const target = event.target as HTMLElement;
    if (event.button !== 0 || !target.closest(this.dragHandle())) {
      return;
    }
    event.preventDefault();
    this.host.setPointerCapture(event.pointerId);
    const { x, y } = this.offset();
    this.start = { x: event.clientX - x, y: event.clientY - y };
    this.dragging.set(true);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.dragging()) {
      return;
    }
    // On garde toujours un bout de la barre de titre à l'écran pour pouvoir la rattraper.
    const rect = this.host.getBoundingClientRect();
    const { x, y } = this.offset();
    const nextX = event.clientX - this.start.x;
    const nextY = event.clientY - this.start.y;
    const baseLeft = rect.left - x;
    const baseTop = rect.top - y;
    this.offset.set({
      x: clamp(nextX, -baseLeft - rect.width + 60, window.innerWidth - baseLeft - 60),
      y: clamp(nextY, -baseTop, window.innerHeight - baseTop - 24),
    });
  }

  protected onPointerUp(event: PointerEvent): void {
    if (!this.dragging()) {
      return;
    }
    this.host.releasePointerCapture(event.pointerId);
    this.dragging.set(false);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

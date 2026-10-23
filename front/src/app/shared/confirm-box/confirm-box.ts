import { Component, input, output } from '@angular/core';
import { DraggableDirective } from '../draggable.directive';

let nextId = 0;

@Component({
  selector: 'app-confirm-box',
  imports: [DraggableDirective],
  templateUrl: './confirm-box.html',
  styleUrl: './confirm-box.css',
})
export class ConfirmBox {
  readonly heading = input('Confirmation');
  readonly message = input.required<string>();
  readonly busy = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected readonly titleId = `confirm-box-title-${nextId++}`;
}

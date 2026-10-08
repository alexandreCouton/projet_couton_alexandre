import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, signal } from '@angular/core';
import { Pollution } from '../models/pollution.model';
import { DraggableDirective } from '../shared/draggable.directive';

@Component({
  selector: 'app-pollution-recap',
  imports: [DatePipe, DecimalPipe, DraggableDirective],
  templateUrl: './pollution-recap.html',
  styleUrl: './pollution-recap.css',
})
export class PollutionRecap implements OnChanges {
  /** Déclaration validée, transmise par le formulaire parent. */
  @Input({ required: true }) pollution!: Pollution;

  /** Demande au parent de réafficher un formulaire vierge. */
  @Output() newDeclaration = new EventEmitter<void>();

  protected readonly photoError = signal(false);

  ngOnChanges(): void {
    this.photoError.set(false);
  }
}

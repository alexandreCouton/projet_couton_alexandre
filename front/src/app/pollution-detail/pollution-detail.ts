import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input, linkedSignal, output } from '@angular/core';
import { Pollution } from '../models/pollution.model';
import { AppWindow } from '../shared/app-window/app-window';

@Component({
  selector: 'app-pollution-recap',
  imports: [DatePipe, DecimalPipe, AppWindow],
  templateUrl: './pollution-recap.html',
  styleUrl: './pollution-recap.css',
})
export class PollutionRecap {
  /** Déclaration validée, transmise par le formulaire parent. */
  readonly pollution = input.required<Pollution>();

  /** Demande au parent de réafficher un formulaire vierge. */
  readonly newDeclaration = output<void>();

  /** Échec de chargement de la photo ; réinitialisé à chaque nouvelle déclaration. */
  protected readonly photoError = linkedSignal({
    source: this.pollution,
    computation: () => false,
  });
}

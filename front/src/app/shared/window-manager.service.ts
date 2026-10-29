import { Injectable, Signal, signal } from '@angular/core';

export interface MinimizedWindow {
  id: string;
  heading: Signal<string>;
  icon: Signal<string | undefined>;
  restore: () => void;
}

@Injectable({ providedIn: 'root' })
export class WindowManager {
  private readonly windows = signal<MinimizedWindow[]>([]);
  readonly minimized = this.windows.asReadonly();

  add(window: MinimizedWindow): void {
    this.windows.update((list) => [...list.filter((w) => w.id !== window.id), window]);
  }

  remove(id: string): void {
    this.windows.update((list) => list.filter((w) => w.id !== id));
  }
}

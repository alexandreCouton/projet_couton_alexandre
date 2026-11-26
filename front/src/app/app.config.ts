import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { provideStore } from '@ngxs/store';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { mockApiInterceptor } from './mocks/mock-api.interceptor';
import { AuthState } from './store/auth/auth.state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideStore([AuthState], withNgxsStoragePlugin({ keys: ['auth'] })),
    provideHttpClient(withInterceptors(environment.mockApi ? [mockApiInterceptor] : [])),
  ],
};

import { NgModule } from '@angular/core';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_BASE_HREF } from '@angular/common';

@NgModule({
  providers: [
    {
      provide: APP_BASE_HREF,
      useFactory: getBaseLocation
    }
  ],
  imports: [AppModule, BrowserAnimationsModule, BrowserModule.withServerTransition({ appId: 'serverApp' })],
  bootstrap: [AppComponent]
})
export class AppBrowserModule {}

export function getBaseLocation() {
  const paths: string[] = location.pathname.split('/').splice(1, 1);
  const basePath: string = (paths && paths[0]) || '';
  return '/' + basePath;
}

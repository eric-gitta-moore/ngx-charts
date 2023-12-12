import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  imports: [AppModule, ServerModule, NoopAnimationsModule, BrowserModule.withServerTransition({ appId: 'serverApp' })],
  bootstrap: [AppComponent]
})
export class AppServerModule {}

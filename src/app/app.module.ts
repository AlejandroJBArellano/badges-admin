import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../environments/environment';
import { HttpClientModule } from '@angular/common/http';

import { IMqttMessage, MqttModule, IMqttServiceOptions } from 'ngx-mqtt';
import { ImportDataComponent } from './dialogs/import-data/import-data.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StoreBadgeComponent } from './dialogs/store-badge/store-badge.component';

export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: environment.mqttServer,
  port: environment.mqttPort,
  path: environment.mqttPath,
};

const modules = [MatFormFieldModule, MatSelectModule, MatProgressSpinnerModule];

@NgModule({
  declarations: [AppComponent, ImportDataComponent, StoreBadgeComponent],
  imports: [
    BrowserModule,
    MatDialogModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ...modules,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { environment } from '../environments/environment';
import { HttpClientModule } from '@angular/common/http';


import {
  IMqttMessage,
  MqttModule,
  IMqttServiceOptions
} from 'ngx-mqtt';

export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: environment.mqttServer,
  port: environment.mqttPort,
  path: environment.mqttPath
};

const modules = [
  MatFormFieldModule,
  MatSelectModule
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ...modules
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

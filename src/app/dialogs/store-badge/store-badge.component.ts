import { TitleCasePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MqttService } from 'ngx-mqtt';

@Component({
  selector: 'app-store-badge',
  templateUrl: './store-badge.component.html',
  styleUrls: ['./store-badge.component.css'],
})
export class StoreBadgeComponent implements OnInit {
  PRINT_TYPE_TITLE_AND_2LINES = 'title_and_2_lines';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _mqttService: MqttService // private titleCasePipe: TitleCasePipe
  ) {}

  ngOnInit(): void {
    console.log(this.data);
  }
  printStoreBadge(store: {
    region: string;
    zona: string;
    tienda: string;
    distrito: string;
  }) {
    let cmd = {
      print_type: this.PRINT_TYPE_TITLE_AND_2LINES,
      title: `Tienda: ${store.tienda}`,
      line1: `Región: ${store.region}. Zona: ${store.zona}`,
      line2: `Distrito: ${store.distrito}`,
    };
    console.log('print attendee', cmd);
    this.unsafePublish(this.data.impresoraFC.value, JSON.stringify(cmd));
  }
  unsafePublish(topic: string, message: string): void {
    this._mqttService.unsafePublish(topic, message, { qos: 0, retain: false });
  }
}

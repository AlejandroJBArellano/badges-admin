import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription} from 'rxjs';

import {
  IMqttMessage,
  MqttModule,
  MqttService,
  IMqttServiceOptions
} from 'ngx-mqtt';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit,OnDestroy {
  title = 'badges-admin';

  subscription: Subscription;

  MQTT_PRINTER_BASE_CMD_TOPIC: string = 'inpulse/cmd/pulses'
  MQTT_PRINTER_ASSIGNMENT_BASE_TOPIC: string = 'print-label/empaquetado'
  selectedPrinter:string = 'printer001'
  selectedStation:string = 'estacion-1'

  MQTT_READER_BASE_DT_TOPIC: string = 'inpulse/readers'
  selectedReader:string = 'pulso054'
  MQTT_READER_ASSIGNMENT_TOPIC:string = 'events/tag_readed'

  PRINT_TYPE_ONLY_TITLE = 'only_title'
  PRINT_TYPE_TITLE_AND_2LINES = 'title_and_2_lines'

  constructor(private _mqttService: MqttService) {
    
    this.subscription = this._mqttService.observe(this.getReaderTopic()).subscribe((message: IMqttMessage) => {
      this.processMessage(message.payload.toString())
    });

    this._mqttService.onConnect.subscribe(event=> {
            console.log('CONNECTED',event);
    });
    this._mqttService.onReconnect.subscribe(event=> {
            console.log('RECONNECTING',event);
    });
    this._mqttService.onError.subscribe(event=> {
            console.log('ERROR',event);
    });
    this._mqttService.onClose.subscribe(event=> {
            console.log('CLOSED',event);
    });
  }

  attendees:any = [];
  cursor:number = 0;
  last_tag_id:any='00000000';

  ngOnInit() {
    //get aaaaall registrations
    //Select Region and Zona
      //order
      //get all badges
      //match against attendees record
      //print table
      //set cursor on last registration

      //on click START
        //set mode to working

      //on read and idle
        //print tag

      //on read and working
        //match user at current cursor with last tag
        //print sticker
        //advance cursor
          //if store finished
            //show TIENDA COMPLETADA, guarda en bolsa
          //if distrito completado
            //show DISTRITO COMPLETADO,
              //imprimir gafete de gerente de distrito
              //guardar en caja
          //if zona completada
              //imprimir gafete de gerente de zona
              //guardar en caja
      for(let i = 0 ; i <100 ; i++){
        this.attendees.push({badge:'rojo'});
      }
      
      while(this.attendees[this.cursor].tag_id){
        this.cursor++;
      }
      console.log("cursor",this.cursor);
      this.attendees[this.cursor].isNext=true;
      let elements = document.getElementsByClassName("cursor")
      if(elements.length>0){
        let el = elements.item(0)
        if(el){
          el.scrollIntoView({block: "start", behavior: "smooth"});
        }
      }
    
  }

  selectReader(reader:string){
    this.selectedReader = reader;
    this.subscription.unsubscribe();
    this.subscription = this._mqttService.observe(this.getReaderTopic()).subscribe((message: IMqttMessage) => {
      this.processMessage(message.payload.toString())
    });
  }

  selectPrintingStation(station:string){
    this.selectedStation=station;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  processMessage(message:string){
    console.log(message);
    try{
      let info = JSON.parse(message);
      if(info.tag_id){
        this.last_tag_id=info.tag_id;
        //vincular tag id en API

        //enviar a imprimir etiqueta
        this.printBadge(this.attendees[this.cursor])
        

        this.attendees[this.cursor].tag_id = info.tag_id
        console.log("modified user:",this.attendees[this.cursor]);
        delete this.attendees[this.cursor].isNext;
        this.cursor++;
        this.attendees[this.cursor].isNext=true;
        if(this.cursor%10==0){
          let elements = document.getElementsByClassName("cursor")
          if(elements.length>0){
            let el = elements.item(0)
            if(el){
              el.scrollIntoView({block: "start", behavior: "smooth"});
            }
          }
        }
      
      }
      
    }catch(error){
      alert(error)
    }
    

  }

  printBadge(user:any){
    if(this.attendees[this.cursor].badge=="azul" ||
      this.attendees[this.cursor].badge=="negro" ||
      this.attendees[this.cursor].badge=="amarillo"){
      this.printManagerBadge(this.attendees[this.cursor]);  
    }else if (this.attendees[this.cursor].badge=="rojo" ){
      this.printAttendeeBadge(this.attendees[this.cursor]);  
    }
  }

  printManagerBadge(user:any){
    let cmd ={
      print_type: this.PRINT_TYPE_ONLY_TITLE,
      title: "Stephanie Jazmín García Guerrero"
    }
    console.log("print manager",cmd);
    this.unsafePublish(this.getPrinterTopic(),JSON.stringify(cmd))
  }

  printAttendeeBadge(user:any){
    let cmd ={
      print_type: this.PRINT_TYPE_TITLE_AND_2LINES,
      title: "Stephanie Jazmín García Guerrero",
      line1: "Miércoles 06 Oct 6:40 am",    
      line2: "Miércoles 06 Oct 7:00 am"
    }
    console.log("print attendee",cmd);
    this.unsafePublish(this.getPrinterTopic(),JSON.stringify(cmd))
  }



  unsafePublish(topic: string, message: string): void {
    this._mqttService.unsafePublish(topic, message, {qos: 0, retain: true});
  }

  getPrinterTopic():string{
    return this.MQTT_PRINTER_BASE_CMD_TOPIC+'/'+this.selectedPrinter+'/'+this.MQTT_PRINTER_ASSIGNMENT_BASE_TOPIC+'/'+this.selectedStation;
  }

  getReaderTopic():string{
    return this.MQTT_READER_BASE_DT_TOPIC+'/'+this.selectedReader+'/'+this.MQTT_READER_ASSIGNMENT_TOPIC
  }

}

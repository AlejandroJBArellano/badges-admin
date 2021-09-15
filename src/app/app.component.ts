import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription} from 'rxjs';
import { APIService } from './api.service';
import {FormControl} from '@angular/forms';
import {
  IMqttMessage,
  MqttModule,
  MqttService,
  IMqttServiceOptions
} from 'ngx-mqtt';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [TitleCasePipe]
})
export class AppComponent implements OnInit,OnDestroy {

  subscription: any = null;

  MQTT_PRINTER_BASE_CMD_TOPIC: string = 'inpulse/cmd/pulses'
  MQTT_PRINTER_ASSIGNMENT_BASE_TOPIC: string = 'print-label/empaquetado'
  selectedPrinter:string = 'printer001'
  selectedStation:string = 'estacion-1'

  MQTT_READER_BASE_DT_TOPIC: string = 'inpulse/readers'
  selectedReader:string = 'pulso054'
  MQTT_READER_ASSIGNMENT_TOPIC:string = 'events/tag_readed'

  PRINT_TYPE_ONLY_TITLE = 'only_title'
  PRINT_TYPE_TITLE_AND_2LINES = 'title_and_2_lines'


  attendees:any = [];
  cursor:number = 0;
  last_tag_id:any='00000000';
  regiones:any = [
    {viewValue:'1000',value:'1000'},
    {viewValue:'1001',value:'1001'},
    {viewValue:'1002',value:'1002'},
    {viewValue:'1003',value:'1003'},
    {viewValue:'1004',value:'1004'},
    {viewValue:'1005',value:'1005'},
    {viewValue:'1006',value:'1006'},
    {viewValue:'1007',value:'1007'},
    {viewValue:'1008',value:'1008'},
    {viewValue:'1009',value:'1009'},
    {viewValue:'corporativo',value:'corporativo'}
  ]
  zonas:any = []
  lectoras:any = [
    {viewValue:'pulso047',value:'inpulse/readers/pulso047/events/tag_readed'},
    {viewValue:'pulso054',value:'inpulse/readers/pulso054/events/tag_readed'},
    {viewValue:'pulso059',value:'inpulse/readers/pulso059/events/tag_readed'},
    {viewValue:'pulso061',value:'inpulse/readers/pulso061/events/tag_readed'},
    {viewValue:'pulso070',value:'inpulse/readers/pulso070/events/tag_readed'},
    {viewValue:'pulso096',value:'inpulse/readers/pulso096/events/tag_readed'}
  ]
  impresoras:any = [
    {viewValue:'lime',value:'inpulse/cmd/pulses/printer001/print-label/empaquetado/estacion-1'},
    {viewValue:'lemon',value:'inpulse/cmd/pulses/printer002/print-label/empaquetado/estacion-2'},
    {viewValue:'apple',value:'inpulse/cmd/pulses/printer003/print-label/empaquetado/estacion-3'},
    {viewValue:'pear',value:'inpulse/cmd/pulses/printer004/print-label/empaquetado/estacion-4'},
    {viewValue:'fig',value:'inpulse/cmd/pulses/printer005/print-label/empaquetado/estacion-5'}
  ]

  regionFC = new FormControl();
  zonaFC = new FormControl();
  lectoraFC = new FormControl();
  impresoraFC = new FormControl();

  working:boolean = false;

  constructor(private _mqttService: MqttService,
    private apiService: APIService,
    public titleCasePipe: TitleCasePipe ) {


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

  

  ngOnInit() {


    this.regionFC.valueChanges.subscribe(region => {
        this.apiService.getStoresByRegion(region).subscribe(stores =>{
          console.log("stores",stores)
          this.zonas = [];
          stores.forEach((store:any)=>{
            if(!this.zonas.find((element:any)=> element.value == store.zona)){
              let zona = {
                viewValue:store.zona,value:store.zona
              }
              this.zonas.push(zona)
            }
          })
        })
    })
    this.lectoraFC.valueChanges.subscribe((lectora:any) => {
      this.selectReader();
    })
    
  }

  selectRegionZona(){
    this.apiService.getUsersByRegion(this.regionFC.value).subscribe((users:any)=>{
      
      this.working=false;

      this.attendees = users
      .filter((user:any)=>user.organization_role.zona == this.zonaFC.value);
      this.attendees.forEach((attendee:any)=>{
          if(!attendee.organization_role.distrito){
            attendee.organization_role.distrito='-';
          }
          if(!attendee.organization_role.tienda){
            attendee.organization_role.tienda='-';
          }

      })

      console.log("attendees",this.attendees)
      
      this.attendees= this.attendees.sort((a:any,b:any)=>(a.organization_role.region.localeCompare(b.organization_role.region) 
        || a.organization_role.zona.localeCompare(b.organization_role.zona)
        || a.organization_role.distrito.localeCompare(b.organization_role.distrito)
        || a.user_role.role.localeCompare(b.user_role.role)
        || a.organization_role.tienda.localeCompare(b.organization_role.tienda)
         ));
      
      //PEDIR LOS DATOS DE TAGS

      this.apiService.getBadgesByZona( this.zonaFC.value).subscribe(badges=>{

        this.attendees.forEach((attendee:any)=>{
          let badge =badges.find( (badge:any) => badge.user_id == attendee._id);
          if(badge){
             attendee.tag_id=badge.tag_id
          }
        })

        this.cursor=0;
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

      })

      
    })
  }

  selectReader(){
    console.log("lectora seleccionada:",this.lectoraFC.value);
    if(this.subscription){
      this.subscription.unsubscribe();  
    }
    this.subscription = this._mqttService.observe(this.lectoraFC.value).subscribe((message: IMqttMessage) => {
      this.processMessage(message.payload.toString())
    });
  }

  startWorking(){
    this.working=true;
  }
  stopWorking(){
    this.working=false;
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

        if(this.working){
          //vincular tag id en API
          this.apiService.addBadge(this.last_tag_id,this.attendees[this.cursor]._id).subscribe(data=>{
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
          },
          error=>{
            console.log("error:",error)
            if(error.error && error.error.error && error.error.error.code==11000){
              alert("Este tag ya existe en la BD")
            }

          })          

        }else{
          //fecth user data
          this.apiService.getBadgeByTagId(this.last_tag_id)
          .subscribe((user:any)=>{
            console.log("user by tag_id",user)
            if(user){
              let info = `USUARIO ENCONTRADO

              nombre: ${user.first_name} ${user.last_name}
              tienda: ${user.organization_role.tienda} 
              tipo: ${user.badge} ${user.user_role.role}
              rzd: ${user.organization_role.region} ${user.organization_role.zona} ${user.organization_role.distrito}
              llegada: ${user.arrivaldate}
              entrada: ${user.accessdate}
              `
              alert(info);
            }
            
          })
        }
        
      
      }
      
    }catch(error){
      alert(error)
    }
    

  }

  printBadge(attendee:any){
    if(attendee.badge=="azul" ||
      attendee.badge=="negro" ||
      attendee.badge=="amarillo"){
      this.printManagerBadge(attendee);  
    }else if (attendee.badge=="rojo" ){
      this.printAttendeeBadge(attendee);  
    }
  }

  printManagerBadge(user:any){
    let cmd ={
      print_type: this.PRINT_TYPE_ONLY_TITLE,
      title: this.titleCasePipe.transform(user.first_name) + ' ' + this.titleCasePipe.transform(user.last_name)
    }
    console.log("print manager",cmd);
    this.unsafePublish(this.impresoraFC.value,JSON.stringify(cmd))
  }

  printAttendeeBadge(user:any){
    let cmd ={
      print_type: this.PRINT_TYPE_TITLE_AND_2LINES,
      title: this.titleCasePipe.transform(user.first_name) + ' ' + this.titleCasePipe.transform(user.last_name),
      line1: user.arrivaldate,    
      line2: user.accessdate
    }
    console.log("print attendee",cmd);
    this.unsafePublish(this.impresoraFC.value,JSON.stringify(cmd))
  }



  unsafePublish(topic: string, message: string): void {
    this._mqttService.unsafePublish(topic, message, {qos: 0, retain: true});
  }


}

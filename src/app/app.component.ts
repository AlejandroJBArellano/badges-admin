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

  MQTT_READER_BASE_DT_TOPIC: string = 'inpulse/readers'
  selectedReader:string = 'pulso054'
  MQTT_READER_ASSIGNMENT_TOPIC:string = 'events/tag_readed'

  PRINT_TYPE_ONLY_TITLE = 'only_title'
  PRINT_TYPE_TITLE_AND_2LINES = 'title_and_2_lines'


  attendees:any = [];
  cursor:number = 0;
  last_tag_id:any='00000000';
  estados:any = [
    {viewValue:'Homely',value:'Homely'},
    {viewValue:'1001',value:'1001'},
    {viewValue:'1002',value:'1002'},
    {viewValue:'1003',value:'1003'},
    {viewValue:'1004',value:'1004'},
    {viewValue:'1005',value:'1005'},
    {viewValue:'1006',value:'1006'},
    {viewValue:'1007',value:'1007'},
    {viewValue:'1008',value:'1008'},
    {viewValue:'1009',value:'1009'},
    {viewValue:'corporativo',value:'corporativo'},
    {viewValue:'expositores',value:'expositores'}
  ]
  titulos:any = [
    {value: 'CEO', viewValue: 'CEO'}
  ]
  lectoras:any = [
    {viewValue:'Pulso016',value:'inpulse/dt/pulses/Pulso016/tag-id'},
    {viewValue:'Pulso075',value:'inpulse/dt/pulses/Pulso075/tag-id'},
    {viewValue:'Pulso073',value:'inpulse/dt/pulses/Pulso073/tag-id'},
    {viewValue:'Pulso048',value:'inpulse/dt/pulses/Pulso048/tag-id'},
    {viewValue:'Pulso024',value:'inpulse/dt/pulses/Pulso024/tag-id'}
  ]
  impresoras:any = [
    {viewValue:'lime',value:'inpulse/cmd/pulses/printer001/print-label/empaquetado/estacion-1'},
    {viewValue:'lemon',value:'inpulse/cmd/pulses/printer002/print-label/empaquetado/estacion-2'},
    {viewValue:'apple',value:'inpulse/cmd/pulses/printer003/print-label/empaquetado/estacion-3'},
    {viewValue:'pear',value:'inpulse/cmd/pulses/printer004/print-label/empaquetado/estacion-4'},
    {viewValue:'fig',value:'inpulse/cmd/pulses/printer005/print-label/empaquetado/estacion-5'},

    {viewValue:'Pulso016',value:'inpulse/cmd/pulses/printer016/print-label/print'},
    {viewValue:'Pulso075',value:'inpulse/cmd/pulses/printer075/print-label/print'},
    {viewValue:'Pulso073',value:'inpulse/cmd/pulses/printer073/print-label/print'},
    {viewValue:'Pulso048',value:'inpulse/cmd/pulses/printer048/print-label/print'},
    {viewValue:'Pulso024',value:'inpulse/cmd/pulses/printer024/print-label/print'}
  ]

  estadoFC = new FormControl();
  tituloFC = new FormControl();
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

    this.lectoraFC.valueChanges.subscribe((lectora:any) => this.selectReader())

    this.apiService.getEstadosValidos().subscribe(
      (res: string[]) => {
        console.log("estados", res)
        this.estados = res.map((estado) => {
          return {
            viewValue: estado,
            value: estado
          }
        })
      }
    )

  }

  selectEstado(){
    this.apiService.getUsersByEstado(this.estadoFC.value || '').subscribe((users:any)=>{
      console.log('users', users)
      this.working=false;
      console.log("unfiltered attendees",users)
      this.attendees = users

      this.attendees.forEach((attendee:any)=>{
        const {pais, titulo, estado, localidad, attendance_type} = attendee.organization_role
        if(!pais){
          attendee.organization_role.pais = '-';
        }
        if(!estado){
          attendee.organization_role.estado = '-';
        }
        if(!titulo){
          attendee.organization_role.titulo = '';
        }
        if(!localidad){
          attendee.organization_role.localidad = '-';
        }
        if(!attendance_type){
          attendee.organization_role.attendance_type = '-';
        }
      })

      console.log("attendees",this.attendees)

      this.attendees = this.attendees.sort((a:any,b:any)=>(a.organization_role.empresa.localeCompare(b.organization_role.empresa)
        || a.organization_role.titulo.localeCompare(b.organization_role.titulo)
        || a.organization_role.pais.localeCompare(b.organization_role.pais)
        || a.user_role.role.localeCompare(b.user_role.role)
        || a.organization_role.estado.localeCompare(b.organization_role.estado)
        || a.organization_role.localidad.localeCompare(b.organization_role.localidad)
         ));

      //PEDIR LOS DATOS DE TAGS
      this.apiService.getBadgesByEstado(this.estadoFC.value).subscribe(badges=>{
        console.log("badges", badges)
        this.attendees.forEach((attendee:any)=>{
          let badge = badges.find( (badge:any) => badge.user_id == attendee._id);
          if(badge){
             attendee.tag_id=badge.tag_id
          }
        })

        this.cursor=0;
        this.attendees[this.cursor].isNext=true;

        this.updateCursor();

        console.log("cursor",this.cursor);

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
            this.advanceCursor();
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
            if(user && user._id){
              let info = `USUARIO ENCONTRADO

              nombre: ${user.first_name} ${user.last_name}
              estado: ${user.organization_role.estado}
              tipo: ${user.badge} ${user.user_role.role}
              rzd: ${user.organization_role.empresa} ${user.organization_role.titulo} ${user.organization_role.pais}
              llegada: ${user.arrivaldate}
              entrada: ${user.accessdate}
              `
              alert(info);
            }

          })
        }
      }

    } catch(error) {
      alert(error)
    }
  }

  printBadge(attendee:any){
    if(attendee.badge=="azul" ||
      attendee.badge=="negro" ){
      this.printManagerBadge(attendee);
    }else if (attendee.badge=="rojo" ){
      this.printAttendeeBadge(attendee);
    }else if (attendee.badge=="amarillo"){
      this.printExhibitorBadge(attendee)
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

  printExhibitorBadge(user:any){
    let cmd ={
      print_type: this.PRINT_TYPE_TITLE_AND_2LINES,
      title: this.titleCasePipe.transform(user.first_name) + ' ' + this.titleCasePipe.transform(user.last_name),
      line1: user.organization_role.estado,
      line2: ''
    }
    console.log("print attendee",cmd);
    this.unsafePublish(this.impresoraFC.value,JSON.stringify(cmd))
  }


  unsafePublish(topic: string, message: string): void {
    this._mqttService.unsafePublish(topic, message, {qos: 0, retain: false});
  }

  advanceCursor10(){
    this.advanceCursor()
    this.advanceCursor()
    this.advanceCursor()
    this.advanceCursor()
    this.advanceCursor()
    this.advanceCursor()
    this.advanceCursor()
    this.advanceCursor()
    this.advanceCursor()
    this.advanceCursor()
  }
  advanceCursor(){
    if(this.attendees[this.cursor].isNext){
        delete this.attendees[this.cursor].isNext;
    }
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
    this.updateCursor()

  }
  updateCursor(){
    while(this.attendees[this.cursor].tag_id){
      if(this.attendees[this.cursor].isNext){
        delete this.attendees[this.cursor].isNext;
      }
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
  }

}

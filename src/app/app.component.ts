import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { APIService } from './api.service';
import { UntypedFormControl } from '@angular/forms';
import { IMqttMessage, MqttService } from 'ngx-mqtt';
import { TitleCasePipe } from '@angular/common';
import { ImportDataComponent } from './dialogs/import-data/import-data.component';
import { StoreBadgeComponent } from './dialogs/store-badge/store-badge.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [TitleCasePipe],
})
export class AppComponent implements OnInit, OnDestroy {
  subscription: any = null;

  MQTT_READER_BASE_DT_TOPIC: string = 'inpulse/readers';
  selectedReader: string = 'pulso054';
  MQTT_READER_ASSIGNMENT_TOPIC: string = 'events/tag_readed';

  PRINT_TYPE_ONLY_TITLE = 'only_title';
  PRINT_TYPE_TITLE_AND_2LINES = 'title_and_2_lines';

  attendees: any = [];
  cursor: number = 0;
  last_tag_id: any = '00000000';
  regiones: any = [
    { viewValue: '1001', value: '1001' },
    { viewValue: '1002', value: '1002' },
    { viewValue: '1003', value: '1003' },
    { viewValue: '1004', value: '1004' },
    { viewValue: '1005', value: '1005' },
    { viewValue: '1006', value: '1006' },
    { viewValue: '1007', value: '1007' },
    { viewValue: '1008', value: '1008' },
    { viewValue: '1009', value: '1009' },
    { viewValue: 'corporativo', value: 'corporativo' },
    { viewValue: 'expositores', value: 'expositores' },
  ];
  titulos: any = [{ value: 'CEO', viewValue: 'CEO' }];
  lectoras: any = [
    { viewValue: 'Pulso016', value: 'inpulse/dt/pulses/Pulso016/tag-id' },
    { viewValue: 'Pulso075', value: 'inpulse/dt/pulses/Pulso075/tag-id' },
    { viewValue: 'Pulso073', value: 'inpulse/dt/pulses/Pulso073/tag-id' },
    { viewValue: 'Pulso048', value: 'inpulse/dt/pulses/Pulso048/tag-id' },
    { viewValue: 'Pulso024', value: 'inpulse/dt/pulses/Pulso024/tag-id' },
  ];
  impresoras: any = [
    {
      viewValue: 'lime',
      value: 'inpulse/cmd/pulses/printer001/print-label/empaquetado/estacion-1',
    },
    {
      viewValue: 'lemon',
      value: 'inpulse/cmd/pulses/printer002/print-label/empaquetado/estacion-2',
    },
    {
      viewValue: 'apple',
      value: 'inpulse/cmd/pulses/printer003/print-label/empaquetado/estacion-3',
    },
    {
      viewValue: 'pear',
      value: 'inpulse/cmd/pulses/printer004/print-label/empaquetado/estacion-4',
    },
    {
      viewValue: 'fig',
      value: 'inpulse/cmd/pulses/printer005/print-label/empaquetado/estacion-5',
    },

    {
      viewValue: 'Pulso016',
      value: 'inpulse/cmd/pulses/printer016/print-label/print',
    },
    {
      viewValue: 'Pulso075',
      value: 'inpulse/cmd/pulses/printer075/print-label/print',
    },
    {
      viewValue: 'Pulso073',
      value: 'inpulse/cmd/pulses/printer073/print-label/print',
    },
    {
      viewValue: 'Pulso048',
      value: 'inpulse/cmd/pulses/printer048/print-label/print',
    },
    {
      viewValue: 'Pulso024',
      value: 'inpulse/cmd/pulses/printer024/print-label/print',
    },
  ];

  regionFC = new UntypedFormControl();
  tituloFC = new UntypedFormControl();
  lectoraFC = new UntypedFormControl();
  impresoraFC = new UntypedFormControl();

  working: boolean = false;

  constructor(
    private _mqttService: MqttService,
    private apiService: APIService,
    public titleCasePipe: TitleCasePipe,
    public dialog: MatDialog
  ) {
    this._mqttService.onConnect.subscribe((event) => {
      console.log('CONNECTED', event);
    });
    this._mqttService.onReconnect.subscribe((event) => {
      console.log('RECONNECTING', event);
    });
    this._mqttService.onError.subscribe((event) => {
      console.log('ERROR', event);
    });
    this._mqttService.onClose.subscribe((event) => {
      console.log('CLOSED', event);
    });
  }

  ngOnInit() {
    this.lectoraFC.valueChanges.subscribe((lectora: any) =>
      this.selectReader()
    );

    this.apiService.getRegionsAvailables().subscribe((res: string[]) => {
      console.log('regiones', res);
      if (!res) return;
      if (res.length > 0) {
        this.regiones = res.map((region) => {
          return {
            viewValue: region,
            value: region,
          };
        });
      }
    });
  }

  selectRegion() {
    this.apiService
      .getUsersByRegion(this.regionFC.value || '')
      .subscribe((users: any) => {
        console.log('users', users);
        this.working = false;
        console.log('unfiltered attendees', users);
        this.attendees = users;

        this.attendees.forEach((attendee: any) => {
          if (!attendee.organization_role.distrito) {
            attendee.organization_role.distrito = '-';
          }
          if (!attendee.organization_role.tienda) {
            attendee.organization_role.tienda = '-';
          }
          if (!attendee.organization_role.zona) {
            attendee.organization_role.zona = '';
          }
          if (!attendee.organization_role.area) {
            attendee.organization_role.area = '';
          }
        });

        console.log('attendees', this.attendees);

        this.attendees = this.attendees.sort(
          (a: any, b: any) =>
            a.organization_role.region.localeCompare(
              b.organization_role.region
            ) ||
            a.organization_role.zona.localeCompare(b.organization_role.zona) ||
            a.organization_role.distrito.localeCompare(
              b.organization_role.distrito
            ) ||
            a.user_role.role.localeCompare(b.user_role.role) ||
            a.organization_role.tienda.localeCompare(
              b.organization_role.tienda
            ) ||
            a.organization_role.area.localeCompare(b.organization_role.area)
        );

        //PEDIR LOS DATOS DE TAGS
        this.apiService
          .getBadgesByRegion(this.regionFC.value)
          .subscribe((badges) => {
            console.log('badges', badges);
            this.attendees.forEach((attendee: any) => {
              let badge = badges.find(
                (badge: any) => badge.user_id == attendee._id
              );
              if (badge) {
                attendee.tag_id = badge.tag_id;
              }
            });

            this.cursor = 0;
            this.attendees[this.cursor].isNext = true;

            this.updateCursor();

            console.log('cursor', this.cursor);
          });
      });
  }

  selectReader() {
    console.log('lectora seleccionada:', this.lectoraFC.value);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = this._mqttService
      .observe(this.lectoraFC.value)
      .subscribe((message: IMqttMessage) => {
        this.processMessage(message.payload.toString());
      });
  }

  startWorking() {
    this.working = true;
  }
  stopWorking() {
    this.working = false;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  processMessage(message: string) {
    console.log(message);
    try {
      let info = JSON.parse(message);
      if (info.tag_id) {
        this.last_tag_id = info.tag_id;

        if (this.working) {
          //vincular tag id en API
          this.apiService
            .addBadge(this.last_tag_id, this.attendees[this.cursor]._id)
            .subscribe(
              (data) => {
                //enviar a imprimir etiqueta
                this.printBadge(this.attendees[this.cursor]);

                this.attendees[this.cursor].tag_id = info.tag_id;
                console.log('modified user:', this.attendees[this.cursor]);
                // TODO: create a varible of the acutal store
                const previousOR =
                  this.attendees[this.cursor].organization_role;
                this.advanceCursor();
                const actualOR = this.attendees[this.cursor].organization_role;
                // TODO: open modal if OR.tienda is different
                if (actualOR.tienda !== previousOR.tienda) {
                  console.log(previousOR);
                  this.openStoreBadgeDialog(previousOR);
                }
                // TODO: on modal "Felicidades terminaste la tienda {nombreTiendaPrevious}" y el botón que diga imprimir etiqueta
                // TODO: mudar función
              },
              (error) => {
                console.log('error:', error);
                if (
                  error.error &&
                  error.error.error &&
                  error.error.error.code == 11000
                ) {
                  alert('Este tag ya existe en la BD');
                }
              }
            );
        } else {
          //fecth user data
          this.apiService
            .getBadgeByTagId(this.last_tag_id)
            .subscribe((user: any) => {
              console.log('user by tag_id', user);
              if (user && user._id) {
                let info = `USUARIO ENCONTRADO

                  nombre: ${user.first_name} ${user.last_name}
                  tienda: ${user.organization_role.tienda}
                  tipo: ${user.badge} ${user.user_role.role}
                  rzd: ${user.organization_role.region} ${user.organization_role.zona} ${user.organization_role.distrito}
                  llegada: ${user.arrivaldate}
                  entrada: ${user.accessdate}
                `;
                alert(info);
              }
            });
        }
      }
    } catch (error) {
      alert(error);
    }
  }

  printBadge(attendee: any) {
    if (attendee.badge == 'azul' || attendee.badge == 'negro') {
      this.printManagerBadge(attendee);
    } else if (attendee.badge == 'rojo') {
      this.printAttendeeBadge(attendee);
    } else if (attendee.badge == 'amarillo') {
      this.printExhibitorBadge(attendee);
    }
  }

  printManagerBadge(user: any) {
    let cmd = {
      print_type: this.PRINT_TYPE_ONLY_TITLE,
      title:
        this.titleCasePipe.transform(user.first_name) +
        ' ' +
        this.titleCasePipe.transform(user.last_name),
    };
    console.log('print manager', cmd);
    this.unsafePublish(this.impresoraFC.value, JSON.stringify(cmd));
  }

  printAttendeeBadge(user: any) {
    let cmd = {
      print_type: this.PRINT_TYPE_TITLE_AND_2LINES,
      title:
        this.titleCasePipe.transform(user.first_name) +
        ' ' +
        this.titleCasePipe.transform(user.last_name),
      line1: user.arrivaldate,
      line2: user.accessdate,
    };
    console.log('print attendee', cmd);
    this.unsafePublish(this.impresoraFC.value, JSON.stringify(cmd));
  }

  printExhibitorBadge(user: any) {
    let cmd = {
      print_type: this.PRINT_TYPE_TITLE_AND_2LINES,
      title:
        this.titleCasePipe.transform(user.first_name) +
        ' ' +
        this.titleCasePipe.transform(user.last_name),
      line1: user.organization_role.tienda,
      line2: '',
    };
    console.log('print attendee', cmd);
    this.unsafePublish(this.impresoraFC.value, JSON.stringify(cmd));
  }

  unsafePublish(topic: string, message: string): void {
    this._mqttService.unsafePublish(topic, message, { qos: 0, retain: false });
  }

  advanceCursor10() {
    this.advanceCursor();
    this.advanceCursor();
    this.advanceCursor();
    this.advanceCursor();
    this.advanceCursor();
    this.advanceCursor();
    this.advanceCursor();
    this.advanceCursor();
    this.advanceCursor();
    this.advanceCursor();
  }
  advanceCursor() {
    if (this.attendees[this.cursor].isNext) {
      delete this.attendees[this.cursor].isNext;
    }
    this.cursor++;
    this.attendees[this.cursor].isNext = true;
    if (this.cursor % 10 == 0) {
      let elements = document.getElementsByClassName('cursor');
      if (elements.length > 0) {
        let el = elements.item(0);
        if (el) {
          el.scrollIntoView({ block: 'start', behavior: 'smooth' });
        }
      }
    }
    this.updateCursor();
  }
  updateCursor() {
    while (this.attendees[this.cursor].tag_id) {
      if (this.attendees[this.cursor].isNext) {
        delete this.attendees[this.cursor].isNext;
      }
      this.cursor++;
      this.attendees[this.cursor].isNext = true;
      if (this.cursor % 10 == 0) {
        let elements = document.getElementsByClassName('cursor');
        if (elements.length > 0) {
          let el = elements.item(0);
          if (el) {
            el.scrollIntoView({ block: 'start', behavior: 'smooth' });
          }
        }
      }
    }
  }
  openImportDataDialog() {
    this.dialog.open(ImportDataComponent);
    console.log('OpenImportDataDialog');
  }
  openStoreBadgeDialog(store: {
    region: string;
    zona: string;
    tienda: string;
    distrito: string;
  }) {
    this.dialog.open(StoreBadgeComponent, {
      data: {
        store,
        impresoraFC: this.impresoraFC,
      },
    } as any);
  }
}

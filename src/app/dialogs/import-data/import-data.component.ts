import { Component, OnInit } from '@angular/core';
import { APIService } from 'src/app/api.service';

@Component({
  selector: 'app-import-data',
  templateUrl: './import-data.component.html',
  styleUrls: ['./import-data.component.css'],
})
export class ImportDataComponent implements OnInit {
  constructor(private service: APIService) {}

  ngOnInit(): void {}

  public importingStores = false;
  public importingUsers = false;
  public importingExhibitors = false;

  public loadingStores = false;
  public loadingUsers = false;
  public loadingExhibitors = false;
  //Hacer loader para cada func
  importStores() {
    this.importingStores = true;
    this.loadingStores = true;
    this.service
      .importStores()
      .catch(() => (this.importingStores = false))
      .finally(() => (this.loadingStores = false));
  }

  importUsers() {
    this.importingUsers = true;
    this.loadingUsers = true;
    this.service
      .importUsers()
      .catch(() => (this.importingUsers = false))
      .finally(() => (this.loadingUsers = false));
  }

  importExhibitors() {
    this.importingExhibitors = true;
    this.loadingExhibitors = true;
    this.service
      .importExhibitors()
      .catch(() => (this.importingExhibitors = false))
      .finally(() => (this.loadingExhibitors = false));
  }
}

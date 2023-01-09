import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class APIService {
  constructor(private http: HttpClient) {}

  getUsersByRegion(region: string): Observable<any> {
    let reqURL = environment.apiBaseURL + '/region';
    return this.http.get<any>(reqURL, {
      params: new HttpParams().set('region', region),
    });
  }

  getUsersById(id: string): Observable<any> {
    let reqURL = environment.apiBaseURL + '/user/' + id;
    return this.http.get<any>(reqURL);
  }

  getStoresByRegion(region: string): Observable<any> {
    let reqURL = environment.apiBaseURL + '/stores';
    let options = { params: new HttpParams().set('region', region) };
    return this.http.get<any>(reqURL, options);
  }

  addBadge(tag_id: string, user_id: string): Observable<any> {
    let reqURL = environment.apiBaseURL + '/tag_id-user';
    let data = {
      tag_id: tag_id,
      id: user_id,
    };
    return this.http.post<any>(reqURL, data);
  }

  getBadgeByTagId(tag_id: string): Observable<any> {
    let reqURL = environment.apiBaseURL + '/tag_id-user';
    let options = { params: new HttpParams().set('tag_id', tag_id) };
    return this.http.get<any>(reqURL, options);
  }

  getBadgesByRegion(region: string): Observable<any> {
    let reqURL = environment.apiBaseURL + '/tag_id-users/all';
    let params = new HttpParams().set('region', region);
    let options = { params: params };
    console.log('options', options);
    console.log('params', params.toString());
    return this.http.get<any>(reqURL, options);
  }

  getUserBytTagId(tag_id: string): Observable<any> {
    let reqURL = environment.apiBaseURL + '/stores';
    let options = { params: new HttpParams().set('tag_id', tag_id) };
    return this.http.get<any>(reqURL, options);
  }
  getRegionsAvailables() {
    const reqURL = environment.apiBaseURL + '/regiones';
    return this.http.get<string[]>(reqURL);
  }

  importExhibitors() {
    let reqURL = environment.apiBaseURL + '/insert-exhibitors';
    return this.http.get<any>(reqURL).toPromise();
  }
  importStores() {
    let reqURL = environment.apiBaseURL + '/insert-stores';
    return this.http.get<any>(reqURL).toPromise();
  }
  importUsers() {
    let reqURL = environment.apiBaseURL + '/insert-users';
    return this.http.get<any>(reqURL).toPromise();
  }
  getReadersAndPrinters(){
    const reqURL = environment.apiBaseURL + '/config-registro-en-sitio';
    return this.http.get<any>(reqURL);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class APIService {

  constructor(private http: HttpClient) { }

  getUsersByTienda(tienda:string):Observable<any>{
    let reqURL = environment.apiBaseURL+'/tienda';
    return this.http.get<any>(reqURL);
  }

  getUsersByRegion(region:string):Observable<any>{
    let reqURL = environment.apiBaseURL+'/region';
    let options = { params: new HttpParams().set('region', region) }
    return this.http.get<any>(reqURL,options);
  }

  getUsersById(id:string):Observable<any>{
    let reqURL = environment.apiBaseURL+'/user/'+id;
    return this.http.get<any>(reqURL);
  }

  getStoresByRegion(region:string):Observable<any>{
    let reqURL = environment.apiBaseURL+'/stores';
    let options = { params: new HttpParams().set('region', region) }
    return this.http.get<any>(reqURL,options);
  }

  addBadge(tag_id:string,user_id:string):Observable<any>{
    let reqURL = environment.apiBaseURL+'/tag_id-user';
    let data = {
      tag_id:tag_id,
      id:user_id
    }
    return this.http.post<any>(reqURL,data)
  }

  getBadgeByTagId(tag_id:string):Observable<any>{
    let reqURL = environment.apiBaseURL+'/tag_id-user';
    let options = { params: new HttpParams().set('tag_id', tag_id) }
    return this.http.get<any>(reqURL,options);
  }

  getBadgesByZona(zona:string):Observable<any>{
    let reqURL = environment.apiBaseURL+'/tag_id-users/all';
    let options = { params: new HttpParams().set('zona', zona) }
    return this.http.get<any>(reqURL,options);
  }

  getUserBytTagId(tag_id:string):Observable<any>{
    let reqURL = environment.apiBaseURL+'/stores';
    let options = { params: new HttpParams().set('tag_id', tag_id) }
    return this.http.get<any>(reqURL,options);
  }
}

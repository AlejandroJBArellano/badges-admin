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

  getUsersByEstado(estado:string):Observable<any>{
    let reqURL = environment.apiBaseURL+'/estado';
    return this.http.get<any>(reqURL, {
      params: new HttpParams().set('estado', estado)
    });
  }

  getUsersByEmpresa(empresa:string):Observable<any>{
    let reqURL = environment.apiBaseURL+'/empresa';
    let options = { params: new HttpParams().set('empresa', empresa) }
    return this.http.get<any>(reqURL,options);
  }

  getUsersById(id:string):Observable<any>{
    let reqURL = environment.apiBaseURL+'/user/'+id;
    return this.http.get<any>(reqURL);
  }

  getStoresByEmpresa(empresa:string):Observable<any>{
    let reqURL = environment.apiBaseURL+'/stores';
    let options = { params: new HttpParams().set('empresa', empresa) }
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

  getBadgesByEstado(estado:string):Observable<any>{
    let reqURL = environment.apiBaseURL+'/tag_id-users/all';
    let params = new HttpParams()
    .set("estado",estado)
    let options = { params: params }
    console.log("options",options)
    console.log("params",params.toString())
    return this.http.get<any>(reqURL,options);
  }

  getUserBytTagId(tag_id:string):Observable<any>{
    let reqURL = environment.apiBaseURL+'/stores';
    let options = { params: new HttpParams().set('tag_id', tag_id) }
    return this.http.get<any>(reqURL,options);
  }
  getEstadosValidos(){
    const reqURL = environment.apiBaseURL+'/estados';
    return this.http.get<string[]>(reqURL)
  }
  getStoresByEstado(estado:string):Observable<any>{
    let reqURL = environment.apiBaseURL+'/stores';
    let options = { params: new HttpParams().set('estado', estado) }
    return this.http.get<any>(reqURL,options);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Options } from 'selenium-webdriver/safari';
//import 'rxjs/add/operator/map'
// import * as auth from '../assets/scripts/unive.taw.framework/auth';
// import * as net from '../assets/scripts/unive.taw.framework/net';

@Injectable()
export class AuthService {

  constructor(private readonly http: HttpClient) { }

  // public Signup(signupRequest: auth.SignupRequestDto): Observable<boolean> {
  //   // let req: HttpRequest<auth.SignupRequestDto> = new HttpRequest<auth.SignupRequestDto>(
  //   //   'POST',
  //   //   'api/users',
  //   //   signupRequest,
  //   //   null);
  //   // return this.http.post<net.HttpResponse<boolean>>('http://localhost:1632/api/users', req).map(result => result.content);
  // }

  // getById(id: number) {
  //   return this.http.get('/api/users/' + id);
  // }

  // create(user: User) {
  //   return this.http.post('/api/users', user);
  // }

  // update(user: User) {
  //   return this.http.put('/api/users/' + user.id, user);
  // }

  // delete(id: number) {
  //   return this.http.delete('/api/users/' + id);
  // }

}

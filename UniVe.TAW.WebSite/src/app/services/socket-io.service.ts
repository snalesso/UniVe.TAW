import { Injectable } from '@angular/core';
import * as socketIOClient from 'socket.io-client';
import { Observable, Subscriber } from 'rxjs';
import ServiceConstants from './ServiceConstants';
import { AuthService } from './auth.service';
import { tap, catchError, map, share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SocketIOService {

  private _socket: SocketIOClient.Socket = socketIOClient(ServiceConstants.ServerAddress);

  private _subscribersCounter: number = 0;

  constructor(private readonly _authService: AuthService) { }

  // private getConnection() {

  //   if (!this._socket) {
  //     this._socket ;
  //   }
  //   else {
  //     if (this._socket.disconnected) {
  //       this._socket.connect();
  //     }
  //   }

  //   return this._socket;
  // }

  on(eventName: string, callback: Function) {
    this._socket.on(eventName, callback);
  }

  once(eventName: string, callback: Function) {
    this._socket.once(eventName, callback);
  }

  connect() {
    return this._socket.connect();
  }

  disconnect(close?: any) {
    return this._socket.disconnect.apply(this._socket, arguments);
  }

  emit(eventName: string, data?: any, callback?: Function) {
    return this._socket.emit.apply(this._socket, arguments);
  }

  removeListener(eventName: string, callback?: Function) {
    return this._socket.removeListener.apply(this._socket, arguments);
  }

  removeAllListeners(eventName?: string) {
    return this._socket.removeAllListeners.apply(this._socket, arguments);
  }

  fromEvent<T>(eventName: string): Observable<T> {

    this._subscribersCounter++;
    return Observable.create((observer) => {
      this._socket.on(eventName, (data: T) => {
        observer.next(data);
      });
      return () => {
        if (this._subscribersCounter === 1)
          this._socket.removeListener(eventName);
      };
    }).pipe(
      share()
    );
  }

  fromOneTimeEvent<T>(eventName: string): Promise<T> {
    return new Promise<T>(resolve => this.once(eventName, resolve));
  }

  // subscribe<T>(eventKey: string) {
  //   let observable = new Observable<T>(observer => {
  //     this._socket = socketIOClient();
  //     this._socket.on(eventKey, (data: T) => {
  //       observer.next(data);
  //     });
  //     return () => {
  //       this._socket.disconnect();
  //     };
  //   })
  //   return observable;
  // }

}

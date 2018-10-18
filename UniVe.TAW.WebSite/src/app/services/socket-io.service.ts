import { Injectable } from '@angular/core';
import * as SocketIOClient from 'socket.io-client';
import * as EngineIOClient from 'engine.io-client';
import { Observable, Subscriber, config } from 'rxjs';
import ServiceConstants from './ServiceConstants';
import { AuthService } from './auth.service';
import { tap, catchError, map, share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SocketIOService {

  private readonly _sockets: SocketIOClient.Socket[] = [];

  private _socket: SocketIOClient.Socket;
  private _subscribersCounter: number = 0;

  constructor(private readonly _authService: AuthService) {

    //this._authService.WhenTokenChanged.pipe(tap((x) => this._openSockets[0].io.))
  }

  private getSocket() {

    if (this._socket != null)
      return this._socket;

    if (this._authService.IsLogged) {
      this._socket = SocketIOClient(
        ServiceConstants.ServerAddress,
        {
          transportOptions: {
            polling: {
              extraHeaders: {
                'Authorization': 'Bearer ' + this._authService.Token
              }
            }
          }
        });
    }

    return this._socket;
  }

  on(eventName: string, callback: Function) {
    this.getSocket().on(eventName, callback);
  }

  once(eventName: string, callback: Function) {
    this.getSocket().once(eventName, callback);
  }

  connect() {
    return this.getSocket().connect();
  }

  disconnect(close?: any) {
    return this.getSocket().disconnect.apply(this._socket, arguments);
  }

  emit(eventName: string, data?: any, callback?: Function) {
    return this.getSocket().emit.apply(this._socket, arguments);
  }

  removeListener(eventName: string, callback?: Function) {
    return this.getSocket().removeListener.apply(this._socket, arguments);
  }

  removeAllListeners(eventName?: string) {
    return this.getSocket().removeAllListeners.apply(this._socket, arguments);
  }

  fromEvent<T>(eventName: string): Observable<T> {

    this._subscribersCounter++;
    return Observable.create((observer) => {
      this.getSocket().on(eventName, (data: T) => {
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

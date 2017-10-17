import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';

export interface Acceleration {
  x: number;
  y: number;
  z: number;
}

export interface AccelerationWatcher {
  x: Observable<number>;
  y: Observable<number>;
  z: Observable<number>;
}

export function createAccelerationObservable(
  windowObj: Window
): Observable<Acceleration> {
  // This isn't really idiomatic angular (the use of browser specific events and window object)
  return Observable.fromEvent(
    windowObj,
    'devicemotion',
    (ev: DeviceMotionEvent) => ({
      x: ev.accelerationIncludingGravity.x,
      y: ev.accelerationIncludingGravity.y,
      z: ev.accelerationIncludingGravity.z,
    })).share();
}

export function createStubAccelerationObservable(): Observable<Acceleration> {
  const getRandomAxisAcceleration = (g: number) => -g + Math.random() * 2 * g;
  return Observable.interval(300).map(() => ({
    x: getRandomAxisAcceleration(9.81),
    y: getRandomAxisAcceleration(9.81),
    z: getRandomAxisAcceleration(9.81)
  })).share();
}

@Injectable()
export abstract class AccelerationService {
  public watchX: Observable<number>;
  public watchY: Observable<number>;
  public watchZ: Observable<number>;

  constructor({x, y, z}: AccelerationWatcher) {
    this.watchX = x;
    this.watchY = y;
    this.watchZ = z;
  }
}

@Injectable()
export class DeviceMotionAccelerationService extends AccelerationService {
  constructor(windowObj: Window) {
    const acceleration = createAccelerationObservable(windowObj);
    super({
      x: acceleration.map(acceleration => acceleration.x),
      y: acceleration.map(acceleration => acceleration.y),
      z: acceleration.map(acceleration => acceleration.z)
    });
  }
}

export function toDeviceMotionServiceFactoryWith(windowObj: Window) {
  return () => new DeviceMotionAccelerationService(windowObj);
}

@Injectable()
export class StubAccelerationService extends AccelerationService {
  constructor() {
    const acceleration = createStubAccelerationObservable();
    super({
      x: acceleration.map(acceleration => acceleration.x),
      y: acceleration.map(acceleration => acceleration.y),
      z: acceleration.map(acceleration => acceleration.z)
    });
  }
}
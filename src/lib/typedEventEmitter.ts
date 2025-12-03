import { EventEmitter } from "events";

export class TypedEventEmitter<Events extends Record<string, any>> {
  private emitter = new EventEmitter();

  emit<K extends keyof Events>(event: K, payload: Events[K]): boolean {
    return this.emitter.emit(event as string, payload);
  }

  on<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void
  ): this {
    this.emitter.on(event as string, listener);
    return this;
  }

  once<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void
  ): this {
    this.emitter.once(event as string, listener);
    return this;
  }

  off<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void
  ): this {
    this.emitter.off(event as string, listener);
    return this;
  }
}

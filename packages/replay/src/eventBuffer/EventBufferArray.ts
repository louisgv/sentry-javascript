import type { AddEventResult, EventBuffer, RecordingEvent } from '../types';

/**
 * A basic event buffer that does not do any compression.
 * Used as fallback if the compression worker cannot be loaded or is disabled.
 */
export class EventBufferArray implements EventBuffer {
  private _events: RecordingEvent[];

  public constructor() {
    this._events = [];
  }

  /** @inheritdoc */
  public get pendingLength(): number {
    return this._events.length;
  }

  /**
   * Returns the raw events that are buffered. In `EventBufferArray`, this is the
   * same as `this._events`.
   */
  public get pendingEvents(): RecordingEvent[] {
    return this._events;
  }

  /** @inheritdoc */
  public destroy(): void {
    this._clear();
  }

  /** @inheritdoc */
  public async addEvent(event: RecordingEvent): Promise<AddEventResult> {
    this._events.push(event);
    return;
  }

  /** @inheritdoc */
  public async clear(untilPos?: number): Promise<void> {
    this._clear(untilPos);
  }

  /** @inheritdoc */
  public finish(): Promise<string> {
    return new Promise<string>(resolve => {
      // Make a copy of the events array reference and immediately clear the
      // events member so that we do not lose new events while uploading
      // attachment.
      const eventsRet = this._events;
      resolve(JSON.stringify(eventsRet));
      this._clear();
    });
  }

  /** Clear all events. */
  private _clear(untilPos?: number): void {
    if (untilPos) {
      this._events.splice(0, untilPos);
    } else {
      this._events = [];
    }
  }
}

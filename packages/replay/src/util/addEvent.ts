import { SESSION_IDLE_DURATION } from '../constants';
import type { AddEventResult, RecordingEvent, ReplayContainer } from '../types';

/**
 * Add an event to the event buffer
 */
export async function addEvent(
  replay: ReplayContainer,
  event: RecordingEvent,
  isCheckout?: boolean,
): Promise<AddEventResult | null> {
  const { eventBuffer, session } = replay;

  if (!eventBuffer) {
    // This implies that `_isEnabled` is false
    return null;
  }

  if (replay.isPaused() || !session) {
    // Do not add to event buffer when recording is paused
    return null;
  }

  // TODO: sadness -- we will want to normalize timestamps to be in ms -
  // requires coordination with frontend
  const isMs = event.timestamp > 9999999999;
  const timestampInMs = isMs ? event.timestamp : event.timestamp * 1000;

  // Throw out events that happen more than 5 minutes ago. This can happen if
  // page has been left open and idle for a long period of time and user
  // comes back to trigger a new session. The performance entries rely on
  // `performance.timeOrigin`, which is when the page first opened.
  if (timestampInMs + SESSION_IDLE_DURATION < new Date().getTime()) {
    return null;
  }

  // Only record earliest event if a new session was created, otherwise it
  // shouldn't be relevant
  const earliestEvent = replay.getContext().earliestEvent;
  if (session.segmentId === 0 && (!earliestEvent || timestampInMs < earliestEvent)) {
    replay.getContext().earliestEvent = timestampInMs;
  }

  if (isCheckout) {
    if (replay.recordingMode === 'error') {
      if (eventBuffer.lastCheckoutEventPos) {
        await eventBuffer.clear(eventBuffer.lastCheckoutEventPos);

        if (!session.segmentId) {
          replay.getContext().earliestEvent = eventBuffer.pendingEvents[0].timestamp;
        }
      }

      eventBuffer.lastCheckoutEventPos = eventBuffer.pendingLength;
    } else {
      await eventBuffer.clear();
    }
  }

  return eventBuffer.addEvent(event);
}

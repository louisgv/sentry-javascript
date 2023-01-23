import { addEvent } from '../../../src/util/addEvent';
import { BASE_TIMESTAMP } from '../..';
import { ReplayContainer } from '../../../src/replay';
import { SESSION_IDLE_DURATION } from '../../../src/constants';
import { createEventBuffer } from '../../../src/eventBuffer';
import { clearSession } from '../../utils/clearSession';
import { useFakeTimers } from '../../utils/use-fake-timers';
import { setupReplayContainer } from '../../utils/setupReplayContainer';

useFakeTimers();

describe('Unit | util | addEvent', () => {
  it('clears queue after two checkouts in error mode', async function () {
    jest.setSystemTime(BASE_TIMESTAMP);

    const replay = setupReplayContainer();
    replay.recordingMode = 'error';

    await addEvent(replay, { data: {}, timestamp: BASE_TIMESTAMP, type: 2 }, false);
    await addEvent(replay, { data: {}, timestamp: BASE_TIMESTAMP + 10, type: 3 });
    await addEvent(replay, { data: {}, timestamp: BASE_TIMESTAMP + 100, type: 2 }, true);

    expect(replay.getContext().earliestEvent).toEqual(BASE_TIMESTAMP);
    expect(replay.eventBuffer?.pendingEvents).toEqual([
      { data: {}, timestamp: BASE_TIMESTAMP, type: 2 },
      { data: {}, timestamp: BASE_TIMESTAMP + 10, type: 3 },
      { data: {}, timestamp: BASE_TIMESTAMP + 100, type: 2 },
    ]);

    await addEvent(replay, { data: {}, timestamp: BASE_TIMESTAMP + 200, type: 2 }, true);

    expect(replay.getContext().earliestEvent).toEqual(BASE_TIMESTAMP + 100);
    expect(replay.eventBuffer?.pendingEvents).toEqual([
      { data: {}, timestamp: BASE_TIMESTAMP + 100, type: 2 },
      { data: {}, timestamp: BASE_TIMESTAMP + 200, type: 2 },
    ]);

    await addEvent(replay, { data: {}, timestamp: BASE_TIMESTAMP + 250, type: 3 }, false);
    await addEvent(replay, { data: {}, timestamp: BASE_TIMESTAMP + 300, type: 2 }, true);

    expect(replay.getContext().earliestEvent).toEqual(BASE_TIMESTAMP + 200);
    expect(replay.eventBuffer?.pendingEvents).toEqual([
      { data: {}, timestamp: BASE_TIMESTAMP + 200, type: 2 },
      { data: {}, timestamp: BASE_TIMESTAMP + 250, type: 3 },
      { data: {}, timestamp: BASE_TIMESTAMP + 300, type: 2 },
    ]);
  });
});

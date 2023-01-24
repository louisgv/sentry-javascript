import pako from 'pako';

import { compress } from '../../../worker/src/compress';

describe('Unit | worker | compress', () => {
  it('compresses multiple events', () => {
    const events = [
      {
        id: 2,
        foo: [false],
      },
    ];

    const compressed = compress(events);

    const restored = pako.inflate(compressed, { to: 'string' });

    expect(restored).toBe(JSON.stringify(events));
  });

  it('ignores empty data', () => {
    const event = {
      id: 1,
      foo: ['bar', 'baz'],
    };

    // @ts-ignore ignoring type for test
    const compressed = compress([null, undefined, event]);

    const restored = pako.inflate(compressed, { to: 'string' });

    expect(restored).toBe(JSON.stringify([event]));
  });
});

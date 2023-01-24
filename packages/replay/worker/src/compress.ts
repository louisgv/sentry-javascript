import pako from 'pako';

type RecordingEvent = Record<string, unknown>;

export function compress(data: RecordingEvent[]): Uint8Array {
  return pako.deflate(buildDeflate(data));
}

function buildDeflate(data: RecordingEvent[]): string {
  // We cannot use backticks, as that conflicts with the stringified worker
  return (
    '[' +
    data
      .filter((event: RecordingEvent) => !!event)
      .map(event => JSON.stringify(event))
      .join(',') +
    ']'
  );
}

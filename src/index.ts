import url from 'node:url';
import { type serveHandler } from '@scaleway/serverless-functions';
import { StrautomatorService } from './modules/strautomator/strautomator.service';
import { parseConfig } from './config';
import { SyncService } from './sync.service';

type ServerHandler = Parameters<typeof serveHandler>[0];
type Event = Parameters<ServerHandler>[0];

export async function handler(event: Event) {
  if (event.httpMethod === 'POST') {
    const config = parseConfig();

    const syncService = new SyncService(config);
    const strautomatorService = new StrautomatorService();

    const stravaActivity = strautomatorService.parseWebhookPayload(event.body);

    await syncService.syncActivity(stravaActivity);

    return {
      statusCode: 204,
    };
  }

  return {
    statusCode: 405,
  };
}

if ('file://' + __filename === url.pathToFileURL(process.argv[1]).href) {
  import('@scaleway/serverless-functions').then(scw_fnc_node => {
    scw_fnc_node.serveHandler(handler, 8080);
  });
}

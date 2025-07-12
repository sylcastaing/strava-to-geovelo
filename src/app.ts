import { parseConfig } from './config';
import { StravaService } from './services/strava.service';
import { GeoveloService } from './services/geovelo.service';

async function main() {
  const config = parseConfig();

  const stravaService = new StravaService(config);
  const geoveloService = new GeoveloService(config);

  //await stravaService.getActivity('15069967611')
  const gpx = await stravaService.getActivityGpx('15032938968');

  console.log(gpx);

  //await geoveloService.pushGpx(gpx);
}

main();

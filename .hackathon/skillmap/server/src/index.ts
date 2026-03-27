import app from './app';
import { env } from './config/env';
import { startEventRatingNotifier } from './jobs/eventRatingNotifier';

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
  startEventRatingNotifier();
});

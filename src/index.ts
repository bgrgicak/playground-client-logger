import { startPlaygroundWeb } from '@wp-playground/client';
import { Logger, addCrashListener, collectPhpLogs, Log, logToMemory } from '@php-wasm/logger';

const iframe = document.getElementById('wp') as HTMLIFrameElement;
const client = await startPlaygroundWeb({
  iframe,
  remoteUrl: 'https://playground.wordpress.net/remote.html',
  blueprint: {
    "steps": [
      {
        "step": "writeFile",
        "path": "/wordpress/wp-content/plugins/fail.php",
        "data": {
          "resource": "url",
          "url": "https://gist.githubusercontent.com/bgrgicak/326aa07eb7bb58edc1c972f566c867a3/raw/3e543fbd150acec0cb58038a7931e24cbd5ccdd3/fail.php"
        }
      },
    ]
  }
});

const myLogHandler = ( log: Log ) => {
  // Do what you want with the log
  console.log('My log handler', log);
};
const logger = new Logger([
  logToMemory,
  myLogHandler,
]);
collectPhpLogs( logger, client );

addCrashListener( logger, ( event: any ) => {
  console.log('Crash listener', event.detail);
} );

await client.isReady();

// Now trigger a fatal error by activating the fail.php plugin.
await client.run(
  {
    code: `
      <?php
      require_once '/wordpress/wp-load.php' ;
      activate_plugin( 'fail.php' );
      `
  }
);
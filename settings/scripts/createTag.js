// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const appVersion = require('../../package.json').version;

const storeVersion = (outputPath) => {
  const dir = path.resolve(path.join(__dirname, outputPath));

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const version = `${appVersion}.${new Date().getMinutes()}`;
  const filename = 'build-tag';
  const fullPath = path.join(outputPath, filename);
  fs.writeFile(fullPath, version, (err) => {
    if (err) {
      throw new Error(err.toString());
    }
    console.log('Version \x1b[33m\x1b[1m%s\x1b[0m extracted to \x1b[1m%s\x1b[0m ', version, fullPath);
  });
};

storeVersion('build');

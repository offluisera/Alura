const { packager } = require('@electron/packager');
const path = require('path');
const fs = require('fs');

async function build() {
  console.log('1. Sincronizando arquivos do web dist...');
  const uiDir = path.join(__dirname, 'ui');
  const webDistDir = path.join(__dirname, '../web/dist');
  
  if (fs.existsSync(uiDir)) {
    fs.rmSync(uiDir, { recursive: true, force: true });
  }
  fs.cpSync(webDistDir, uiDir, { recursive: true });
  console.log('✓ Arquivos da UI copiados.');

  console.log('2. Empacotando Alura Desktop Portable com @electron/packager...');
  const options = {
    dir: __dirname,
    name: 'Alura',
    platform: 'win32',
    arch: 'x64',
    out: path.join(__dirname, 'release-builds'),
    overwrite: true,
    prune: false,
    ignore: [
      /^\/release-builds/,
      /^\/\.turbo/,
      /^\/dist/,
      /\.map$/
    ]
  };

  const appPaths = await packager(options);

  console.log('✓ Build portátil concluído com sucesso!');
  console.log('Diretório do executável:', appPaths);
}

build().catch(err => {
  console.error('Erro no empacotamento:', err);
  process.exit(1);
});

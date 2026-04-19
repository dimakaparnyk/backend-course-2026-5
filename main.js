const { program } = require('commander');
const http = require('http');
const fsSync = require('fs');
const path = require('path');

// параметри командного рядка
program
  .requiredOption('-h, --host <address>', 'адреса сервера')
  .requiredOption('-p, --port <number>', 'порт сервера')
  .requiredOption('-c, --cache <path>', 'шлях до директорії кешу');

program.parse(process.argv);
const options = program.opts();

if (!fsSync.existsSync(options.cache)) {
  fsSync.mkdirSync(options.cache, { recursive: true });
  console.log(`Директорію для кешу створено: ${options.cache}`);
} else {
  console.log(`Знайдено існуючу директорію кешу: ${options.cache}`);
}

// базовий HTTP сервер
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end("Проксі-сервер запущено і він готовий до роботи!");
});

server.listen(options.port, options.host, () => {
  console.log(`Сервер успішно слухає запити за адресою http://${options.host}:${options.port}`);
});
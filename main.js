const { program } = require('commander');
const http = require('http');
const fsSync = require('fs');
const fs = require('fs').promises;
const path = require('path');

program
  .requiredOption('-h, --host <address>', 'адреса сервера')
  .requiredOption('-p, --port <number>', 'порт сервера')
  .requiredOption('-c, --cache <path>', 'шлях до директорії кешу');

program.parse(process.argv);
const options = program.opts();

if (!fsSync.existsSync(options.cache)) {
  fsSync.mkdirSync(options.cache, { recursive: true });
  console.log(`Директорію для кешу створено: ${options.cache}`);
}

const server = http.createServer(async (req, res) => {
  const codeMatch = req.url.match(/^\/(\d+)$/);
  if (!codeMatch) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Not Found');
  }

  const httpCode = codeMatch[1];
  const filePath = path.join(options.cache, `${httpCode}.jpg`);

  try {
    if (req.method === 'GET') {
      try {
        const imageBuffer = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(imageBuffer);
      } catch (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    } 
    
    else if (req.method === 'PUT') {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', async () => {
        try {
          const bodyBuffer = Buffer.concat(chunks);
          await fs.writeFile(filePath, bodyBuffer);
          res.writeHead(201, { 'Content-Type': 'text/plain' });
          res.end('Created');
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
      });
    } 
    
    else if (req.method === 'DELETE') {
      try {
        await fs.unlink(filePath);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
      } catch (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    } 
    
    else {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method Not Allowed');
    }

  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(options.port, options.host, () => {
  console.log(`Сервер слухає запити за адресою http://${options.host}:${options.port}`);
});
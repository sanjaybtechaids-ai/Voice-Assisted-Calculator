const http = require("http");
const fs = require("fs");
const path = require("path");

const port = 3000;
const publicDir = __dirname;

const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8"
};

const server = http.createServer((req, res) => {
    const requestedPath = req.url === "/" ? "/index.html" : req.url;
    const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.join(publicDir, safePath);

    fs.readFile(filePath, (error, content) => {
        if (error) {
            res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("File not found");
            return;
        }

        const extension = path.extname(filePath);
        res.writeHead(200, { "Content-Type": mimeTypes[extension] || "application/octet-stream" });
        res.end(content);
    });
});

server.listen(port, () => {
    console.log(`Calculator running at http://localhost:${port}`);
});

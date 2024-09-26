
import express from "express";
import{dirname} from "path"
import { fileURLToPath } from "url";



import {createReadStream, statSync} from "fs"


const __filename = fileURLToPath(import.meta.url)

const __dirname = dirname(__filename)



const app = express()

app.get("/", (req, res) => {
    res.send("Hello stream");
});






app.get("/video", (req, res) => {
    const filePath = `${__dirname}/public/video.mp4`
    const stat = statSync(filePath)
    const fileSize = stat.size
    const range = req.headers.range

    if (!range) {
        // Send a 416 Range Not Satisfiable if no range is provided
        res.status(416).send('Range Not Satisfiable');
        return;
    }
    
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + 1000000, fileSize - 1)
    const chunkSize = end - start + 1

    if (start >= fileSize || end >= fileSize) {
        res.status(416).send('Range Not Satisfiable');
        return;
    }

    const fileStream = createReadStream(filePath, { start, end })
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4",
    
    }

    res.writeHead(206, headers)
    console.log(headers,"headers")
    fileStream.pipe(res)
})
app.listen(4000, () => {
    console.log("server is running")
})
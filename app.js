const fs = require("fs");
const ytdl = require("ytdl-core");
const readline = require("readline");
var ytpl = require("ytpl");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

const url =
  "https://www.youtube.com/watch?v=DX3jU7aviKw&list=PL4n2efOD6sySCVGbIcLykFvubehbtS9pf&ab_channel=Truy%E1%BB%87nmaQu%C3%A0ngAT%C5%A9n";

getList();

function removeVietnameseTones(str) {
  const newStr = str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
  return newStr;
}

function delay() {
  return new Promise(resolve => setTimeout(resolve, 3000));
}

async function delayedLog(vidId, titlePlaylist, titleFile) {
  // notice that we can await a function
  // that returns a promise
  await downloadItem(vidId, titlePlaylist, titleFile);
  console.log("DONEEEE : =>>>> ", titleFile);
}

async function getList() {
  const playlist = await ytpl(url, { pages: 1 });

  const vidArray = playlist.items;
  const titlePlaylist = removeVietnameseTones(playlist.title).replace(/[^A-Z0-9]+/ig, "_")
  const dirName = "./folder/" + titlePlaylist;
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName);
  }
  console.log(vidArray.length + " Videos of Playlist Fetched !...");

  for (const [i, item] of vidArray.entries()) {
    let vid = item;
    let vidId = vid.id;
    let titleFile = i + "_" + removeVietnameseTones(vid.title).replace(/[^A-Z0-9]+/ig, "_");
    await delayedLog(vidId, titlePlaylist, titleFile);
  }
  console.log("Done!");
}

function downloadItem(id, dir, titleFile) {
  return new Promise(resolve => {
    let stream = ytdl(id, {
      quality: "highestaudio",
    });
  
    let starttime = Date.now();
    ffmpeg(stream)
      .audioBitrate(128)
      .save(`${__dirname}/folder/${dir}/${titleFile}.mp3`)
      .on("progress", (p) => {
        readline.cursorTo(process.stdout, 1);
  
        process.stdout.write(`${titleFile} has ${p.targetSize} kb downloaded`);
      })
      .on("end", () => {
        console.log(`\ndone, ${(Date.now() - starttime) / 1000}s`);
        resolve();
      });
  });
}

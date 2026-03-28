import path from "path";
import { spawn } from "child_process";

function getFfmpegPath() {
  const isDev = !require('electron').app.isPackaged;

  if (isDev) {
    // 开发环境
    return path.join(__dirname, '../../resources/ffmpeg/bin/ffplay.exe');
  } else {
    // 打包后
    return path.join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'ffmpeg', 'bin', 'ffplay.exe');
  }
}

const pathToFfplay = getFfmpegPath();
console.log('pathToFfplay: ', pathToFfplay, __dirname)

function playLiveStream(url: string) {
  spawn(pathToFfplay, ['-x', '800', '-y', '600', '-fflags', 'nobuffer', '-flags', 'low_delay', '-framedrop', '-analyzeduration', '0', url])
}


export { playLiveStream }
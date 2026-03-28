import path from "path";
import { spawn } from "child_process";

function getPyqtPath() {
  const isDev = !require('electron').app.isPackaged;

  if (isDev) {
    // 开发环境
    return path.join(__dirname, '../../resources/pyqt/pyqt.exe');
  } else {
    // 打包后
    return path.join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'pyqt', 'pyqt.exe');
  }
}

const pyqtPath =  getPyqtPath();
console.log('pathToPyqt: ', pyqtPath, __dirname)

function contactQt(planeId: string) {
  const pyqtProcess = spawn(pyqtPath, [], {stdio: ["pipe", "pipe", "pipe"]})

  pyqtProcess.on("spawn", () => {
    console.log("PyQt process started")
    pyqtProcess.stdin.write(`Hello from Electron! Plane ID: ${planeId}\n`)
  })

  pyqtProcess.stdout.on("data", (data) => {
    console.log(`PyQt stdout: ${data}`)
    console.log(`PyQt stdout buffer: ${[...data]}`)
  })

  pyqtProcess.stderr.on("data", (data) => {
    console.error(`PyQt stderr: ${data}`)
    pyqtProcess.stdin.write("__EXIT__\n")
    pyqtProcess.stdin.end() // 可选，关闭 stdin
  })

  return pyqtProcess
}


export { contactQt }
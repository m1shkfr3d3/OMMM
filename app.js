document.querySelector("#close").onclick = () => {
  window.close();
}

const { BrowserWindow, dialog } = require('@electron/remote')
let win = BrowserWindow.getFocusedWindow()
document.querySelector("#hide").onclick = () => {
  win.minimize();
}

//imports
var Dialogs = require('dialogs');var dialogs = Dialogs(opts = {cancel:"Отмена"})
var AdmZip = require("adm-zip");
const fs = require('fs')
const homedir = require('os').homedir()

let modspath = ""

function pickfolder(reqired = false) {
  dialogs.alert('Выберете папку с модами').then(() => {
    dialog.showOpenDialog(win,{ properties: ['openDirectory'] }).then((value) => {
      if (fs.existsSync(value.filePaths[0])) {
        modspath = value.filePaths[0]
        fs.writeFileSync('./settings.json', JSON.stringify({ 'modspath': modspath }))
        updateModpacks();
      }
      else if (reqired) {
        dialogs.alert('Вы должны выбрать папку!')
        window.close()
      }
    })
  });
}

const modpackslist = document.querySelector('#modpacksList')
if (fs.existsSync('./settings.json')) {
  modspath = JSON.parse(fs.readFileSync('./settings.json', 'utf8')).modspath;
  if (!fs.existsSync(modspath)) {
    pickfolder(true);
  }
  else {
    updateModpacks();
  }
}
else {
  pickfolder(true)
}

document.querySelector('#selFolder').onclick = () => { pickfolder(false) }

const { exec } = require("child_process");

document.querySelector('#openFolder').onclick = () => { exec("explorer " + modspath) }

function getFoldersInDirectory(directoryPath) {
  return fs.readdirSync(directoryPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}


function updateModpacks() {
  modpackslist.innerHTML = ""
  getFoldersInDirectory(modspath).forEach(modpack => {
    modpackslist.innerHTML += `<span class="card">
    <h1>${modpack}</h1>
    <span class="btns">
        <button class="primary" onclick="selectModpack('${modpack}')"><span class="material-symbols-outlined">done</span></button>
        <button onclick="removeModpack('${modpack}')"><span class="material-symbols-outlined">delete</span></button>
        <button onclick="renameModpack('${modpack}')"><span class="material-symbols-outlined">edit</span></button>
        <button onclick="openModpack('${modpack}')"><span class="material-symbols-outlined">folder_open</span></button>
        <button onclick="exportModpack('${modpack}')"><span class="material-symbols-outlined">upload</span></button>
    </span>`
  });
}

document.querySelector('#update').onclick = updateModpacks;

function walkfiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(dirent => dirent.isFile())
    .map(dirent => dirent.name);
}
function removeMods() {
  walkfiles(modspath).forEach(file => {
    fs.rmSync(`${modspath}\\` + file)
  });
}
document.querySelector('#removeMods').onclick = removeMods;

async function removeModpack(modpack) {
  if (await dialogs.confirm(`вы точно хотите удалить модпак ${modpack}?`)) {
    walkfiles(`${modspath}\\${modpack}`).forEach(file => {
      fs.rmSync(`${modspath}\\${modpack}\\` + file)
    });
    fs.rmdirSync(`${modspath}\\${modpack}`)
  }
  updateModpacks();

}

function openModpack(modpack) {
  exec(`explorer ${modspath}\\${modpack}`)
}
const addInput = document.querySelector("#add")
document.querySelector('#addbtn').onclick = () => {
  try {
    if (addInput.value.replace(/\s/g, '').length == 0) {
      return;
    }

    fs.mkdirSync(`${modspath}\\` + addInput.value);
    openModpack(addInput.value);
    updateModpacks();
    addInput.value = "";

  }
  catch (e) {
    dialogs.alert(e.toString());
  }

}
function selectModpack(modpack) {
  removeMods();
  walkfiles(`${modspath}\\${modpack}`).forEach(file => {
    fs.copyFileSync(`${modspath}\\${modpack}\\${file}`, `${modspath}\\${file}`)
  });
  dialogs.alert(`Выбран ${modpack}`)

}
async function renameModpack(modpack) {
  const newName = await dialogs.prompt('Введите новое имя для модпака', modpack)
  if (newName != undefined && newName.replace(/\s/g, '').length != 0) {
    fs.renameSync(`${modspath}\\${modpack}`, `${modspath}\\${newName}`)
    updateModpacks();
  }
}
function exportModpack(modpack){
  var zip = new AdmZip();
  walkfiles(`${modspath}\\${modpack}`).forEach(i=>{
    zip.addLocalFile(`${modspath}\\${modpack}\\${i}`)
  })
  zip.writeZipPromise(`${homedir}\\Documents\\${modpack}.zip`).then(i=>{
    exec(`explorer /select,"${homedir}\\Documents\\${modpack}.zip"`)
  })
}

function getFilenameFromPath(filePath) {
  // Split the path by the directory separator, which works for both Unix and Windows paths
  const pathSegments = filePath.split(/[\\/]/);

  // The last element in the pathSegments array is the filename
  return pathSegments[pathSegments.length - 1].replace(/\.[^/.]+$/, '');;
}

document.querySelector('#import').onclick=()=>{
  const arch = dialog.showOpenDialogSync(win,{properties:['openFile'],filters: [{name:'OMMM modpack', extensions:['zip']}]})[0]
  var zip = new AdmZip(arch)
  fs.mkdirSync(`${modspath}\\${getFilenameFromPath(arch)}`)
  zip.extractAllTo(`${modspath}\\${getFilenameFromPath(arch)}`)
  updateModpacks();
  dialogs.alert('Модпак ' + getFilenameFromPath(arch) + ' импортирован!')
}
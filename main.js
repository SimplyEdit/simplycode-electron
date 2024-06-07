const { dialog, app, BrowserWindow, net, protocol, session } = require('electron')
const path = require('node:path')
const url = require('url')
const data = []
const fs = require('fs')

// https://github.com/sindresorhus/electron-main-fetch

let dataDir;

const createWindow = () => {
    const win = new BrowserWindow({
      width: 1024,
      height: 786,
      title: "Simply Code",
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: false,
        allowRunningInsecureContent : true
      },
      icon: path.join(__dirname, '/simplycode/camil_512x512.png')

    })
  
    win.loadURL('simplycode://index.html')
}

const createSecondWindow = (dataDir) => {
    const win2 = new BrowserWindow({
      width: 1024,
      height: 786,
      title: "My App",
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: false,
        allowRunningInsecureContent : true
      },
      icon: path.join(__dirname,'/simplycode/camil_512x512.png')
    })
  
    win2.loadURL('simplyapp://generated.html')
}

function readRecursive(componentPath) { 
    if(componentPath.endsWith('\/')){
        componentPath = componentPath.substring(0, (componentPath.length - 1))
    }
    const pathicles = componentPath.split('\/');
    const componentName = pathicles.pop();
    const componentDirectory = pathicles.join('/');

    var target = dataDir + componentDirectory + '\/' + componentName;

    if (fs.lstatSync(target).isDirectory()) {
        const files = fs.readdirSync(target);
        const result = [];
        files.forEach((file) => {
            if (file !== '.' && file !== '..' && !file.startsWith('.')) {
                let data = {};
                if (fs.existsSync(target + '/meta')) {
                    data = JSON.parse(fs.readFileSync(target + '/meta', 'utf8'));
                }
                if (fs.existsSync(target + '/meta.json')) {
                    data = JSON.parse(fs.readFileSync(target + '/meta.json', 'utf8'));
                }
                data.id = file;
                data['ctime'] = fs.lstatSync(target + '\/' + file).ctime;
                data['ctime-human'] = new Date(data['ctime']).toISOString();
                data['contents'] = readRecursive(componentPath + '\/' + file);
                result.push(data);
            }
        });
        return result;
    } else {
        return fs.readFileSync(target, 'utf8');
    }
}

function guid() {
     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function tagId() {
    const random1 = Math.floor(Math.random() * 1000);
    const random2 = Math.floor(Math.random() * 1000);

    const formattedString = `${String(random1).padStart(3, '0')}-${String(random2).padStart(3, '0')}`;

    return formattedString;
}

app.commandLine.appendSwitch('disable-site-isolation-trials');

protocol.registerSchemesAsPrivileged([
    {
      scheme: 'simplycode',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true
      }
    },
    {
      scheme: 'simplyapp',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true
      }
    }
])

async function createComponentDirectory(componentPath){
    fs.mkdirSync((dataDir + componentPath), { recursive: true }, (err) => {
        if (err) throw err
        console.log("making a component directory failed")
    })
     
}

async function createComponentFile(componentPath, filecontent){
    filecontent.text()
    .then(function(filecontent) {
        fs.writeFileSync((dataDir + componentPath), filecontent, (err) => {
            if (err) throw err
         console.log(" making a component file failed")
        })
    })
}

app.whenReady().then(() => {
    if (require('electron-squirrel-startup') === true) app.quit(); // prevents Squirrel.Windows from launching your app multiple times during the installation/updating/uninstallation.

    protocol.handle('simplycode', (request) => {
        let componentPath = new URL(request.url).pathname
        console.log(componentPath)   
        if(componentPath.endsWith('\/')){
            componentPath = componentPath.substring(0, (componentPath.length - 1))
        }
        
        let pathicles = componentPath.split('\/');
        let componentName = pathicles.pop();
        let componentDirectory = pathicles.join('/');
        pathicles.shift();

        if(pathicles[0] === "api") {
            pathicles.shift();
            componentDirectory = pathicles.join('/');

            switch (request.method){
                case 'OPTIONS':
                    if(fs.existsSync(dataDir + componentDirectory + "/" + componentName)){
                        return new Response('"ok"', { status: 200})
                    } else {
                        return new Response('"Not found"', { status: 404})
                    }
                break
                case 'DELETE':
                    if(fs.existsSync(dataDir + componentDirectory + "/" + componentName)){
                        fs.rmSync((dataDir + componentDirectory + "/" + componentName), { recursive: true, force: true })
                        return new Response('"deleted"', { status: 200})
                    } else {
                        return new Response('"Not found"', { status: 404})
                    }         
                break        
                case 'PUT':
                    return createComponentDirectory(componentDirectory)
                        .then(createComponentFile(componentDirectory + "/" + componentName, request))
                        .then(function() { return new Response('"ok"', { status: 200})})
                        .catch(function(){ return new Response('"something went wrong"', { status : 500 })}) // @TODO : return the error code 
                break
                case 'GET':
                default:
                    if(fs.existsSync(dataDir + componentDirectory + "/" + componentName)){
                        const filestuff = readRecursive(componentDirectory + "/" + componentName)
                        return new Response(JSON.stringify(filestuff), {})
                    } else {
                        return new Response('"Not found"', { status: 404})
                    }
                break
            }
        } else {
            switch (request.method){
                default:
                    if(componentPath.endsWith('\/')){
                        componentPath = componentPath.substring(0, (componentPath.length - 1))
                    }

                    if (!componentPath || componentPath === "/") {
                        const filestuff = fs.readFileSync(__dirname + '/simplycode/index.html')
                        return new Response(filestuff, {
                            // headers: { 'content-type': 'text/html' }
                        })
                    } else {
                        var target = __dirname + '/simplycode' + componentDirectory + '\/' + componentName;
                        if(fs.existsSync(target)) {

                            if (fs.lstatSync(target).isDirectory()) {
                                // Do the recursive read thing;
                            } else {
                                const filestuff = fs.readFileSync(__dirname + '/simplycode' + componentDirectory + '\/' + componentName)
                                return new Response(filestuff, {
                                    // headers: { 'content-type': 'text/html' }
                                })
                            }
                        } else {
                            return new Response("Not found", {"status" : 404})
                        }
                    }
                break    
            }
        }
    })

    protocol.handle('simplyapp', (request) => {
        let componentPath = new URL(request.url).pathname
        console.log('simplyapp:' + componentPath)
        if(componentPath.endsWith('\/')){
            componentPath = componentPath.substring(0, (componentPath.length - 1))
        }
        
        let pathicles = componentPath.split('\/'); // also splits on an empty string
        
        let componentName = pathicles.pop();

        if (pathicles[0] == ''){
            pathicles.shift()
        }

        let componentDirectory = pathicles.join('/');
     
        switch (request.method){
            default:
                if(componentPath.endsWith('\/')){
                    componentPath = componentPath.substring(0, (componentPath.length - 1))
                } 

                if (!componentPath || componentPath === "/") {
                    const filestuff = fs.readFileSync(dataDir + '/generated.html')
                    return new Response(filestuff, {
                        // headers: { 'content-type': 'text/html' }
                    })

                } else {
                    var target = dataDir + componentDirectory + '\/' + componentName;
                    if(fs.existsSync(target)) {
                        const filestuff = fs.readFileSync(target)

                        return new Response(filestuff, {
                            // headers: { 'content-type': 'text/html' }
                        })
                    } else {
                        if (
                            (componentPath === "/js/simply-edit.js") ||
                            (componentPath === "/js/simply.everything.js")
                        ) {
                            const filestuff = fs.readFileSync(__dirname + '/simplycode' + componentDirectory + '\/' + componentName)
                            return new Response(filestuff, {
                                // headers: { 'content-type': 'text/html' }
                            })
                        }
                        return new Response("Not found", {"status" : 404})
                    }
                }    
            break    
            }     
        }    
    })

    if (process.argv[1]) {
        dataDir = path.resolve(process.argv[1]);
    } else {
        dataDir = dialog.showOpenDialogSync({properties: ['openDirectory']})[0];
    }
    console.log(dataDir);
    if (!dataDir.match(/\/$/)) {
        dataDir += "/";
        console.log(dataDir);
    }
    createWindow()
    createSecondWindow(dataDir)

    app.on('activate', () => {  // needed for macos
        if (BrowserWindow.getAllWindows().length === 0) {
            if (process.argv[1]) {
                dataDir = path.resolve(process.argv[1]);
            } else {
                dataDir = dialog.showOpenDialogSync({properties: ['openDirectory']})[0];
            }
            if (!dataDir.match(/\/$/)) {
                dataDir += "/";
            }
            createWindow()
            createSecondWindow(dataDir)
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

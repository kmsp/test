import StaticServer from 'react-native-static-server';
import './ScreenUtils.js';
import fs from 'react-native-fs'


const baseFile =global.DEVICE.android ? fs.ExternalDirectoryPath : fs.LibraryDirectoryPath + "/ColaApp";


export default class StaticServerUtil{
  server = new StaticServer(16889, baseFile, {localOnly:true});

  start(){
    this.server.start().then( onfulfiled:(url) => {

    });
  }
  stop(){
    this.server.stop();
  }
  getUrl(){
    return this.server._origin;
  }
  isRunning(){
    const isRunning = this.server.running;
    return isRunning;
  }
}

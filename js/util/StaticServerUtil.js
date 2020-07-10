import StaticServer from 'react-native-static-server';
import './ScreenUtils.js';
import fs from 'react-native-fs'
import RNFS from 'react-native-fs';

const baseFile =global.DEVICE.android ? fs.ExternalDirectoryPath : fs.LibraryDirectoryPath + "/ColaApp";


class StaticServerUtil{

  server = new StaticServer(8080, baseFile, {localOnly:true});

  start(){
    console.log('baseFile', baseFile)
    this.server.start().then((url) => {
      console.log("Serving at URL", url);
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

const StaticServerUtilInstance = new StaticServerUtil();
export default StaticServerUtilInstance;

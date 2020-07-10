import fs from 'react-native-fs'
import { queryDownloadVideoAll, writeDownloadVideo,deleteDownloadVideo } from '../util/DButils'
import DeviceStorage from "../util/DeviceStorage"
import {DeviceEventEmitter} from 'react-native'
import './ScreenUtils.js';

const baseFile =global.DEVICE.android ? fs.ExternalDirectoryPath : fs.LibraryDirectoryPath + "/ColaApp";
fs.exists(baseFile).then(exists => {
  if (!exists) {
    fs.mkdir(baseFile)
  }
})




class DownloadManager {

  /**
   * 删除文件
   * @param {*} data
   */
  deleteCacheVideo(data) {
    return new Promise(async function(resolve,reject) {
      try {
        let file = data.file;
        console.log('dir', file);
        let exitis = await fs.exists(file)
        if (exitis) {
          let data_file = data.url.split('/');
          let file_name = data_file[data_file.length - 4];
          let file_data = data_file[data_file.length - 5];
          let newFilePath = baseFile + '/' + file_data + '/' + file_name;
          let newexitis = await fs.exists(newFilePath);
          if(newexitis){
            await fs.unlink(newFilePath)
            //同时删除数据库的记录
            await deleteDownloadVideo(data)
            resolve(true)
          }else{
          reject(false)
          }

          resolve(true)
        } else {
          let data_file = data.url.split('/');
          let file_name = data_file[data_file.length - 4];
          let file_data = data_file[data_file.length - 5];
          let newFilePath = baseFile + '/' + file_data + '/' + file_name;
          let newexitis = await fs.exists(newFilePath);
          if(newexitis){
            await fs.unlink(newFilePath)
            //同时删除数据库的记录
            await deleteDownloadVideo(data)
            resolve(true)
          }else{
          reject(false)
          }
        }
      } catch (error) {
        console.log('netlog-', error)
        reject(false)
      }
    })
  }

  checkSafeUrl(data) {
    let url = data.url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      DeviceEventEmitter.emit('showToast',"非法的下载链接");
      return false;
    } else if (url.indexOf('.m3u8') > -1) {
      if (url.indexOf('?') > -1) {
        data.url = url.substring(0, url.indexOf('?'))
      }
      return true;
    } else if (url.indexOf('.mp4') > -1) {
      if (url.indexOf('?') > -1) {
        data.url = url.substring(0, url.indexOf('?'))
      }
      return true;
    }
    DeviceEventEmitter.emit('showToast', url+"暂不支持此格式视频")
    return false;
  }

  /**
   * 正在进行中的任务
   *  {
   *    maxProgress: 100,
        progress: 0,
        status:0, // 0 运行中 -1 失败 2成功
        toFile:toFile,
   *  }
   */
  allRunningTask = new Map();
  waitingTask = new Map();
  listeners = new Set();


  addListener(listener = () =>{ }){
    this.listeners.add(listener)
  }


  removeListener(listener = () => { }) {
    if (this.listeners.has(listener)) {
      this.listeners.delete(listener)
    }
  }

  /**
   * 观察者模式，对外发送通知
   */
  _updatelisteners() {
    for (let listener of this.listeners) {
      listener && listener();
    }
  }

  downLoad(data) {
    let result = this.checkSafeUrl(data);
    if (result) {
      this.startDownloadM3U8(data)
    }
  }

  resetDownLoad(data) {
    let result = this.checkSafeUrl(data);
    if (result) {
      if (this.allRunningTask.has(data.id)) {
        this.allRunningTask.delete(data.id)
      }
      this.startDownloadM3U8(data)
    }
  }

  /**
   * 开始下载m3u8文件
   * @param {*} url
   */
  async startDownloadM3U8(data) {
    console.log('netlog-download', data.id)
    console.log('allRunningTask size', this.allRunningTask.size)

    //已经存在了，直接return
    if (this.allRunningTask.has(data.id)) {
      if (this.allRunningTask.get(data.id).status == 0) {
        DeviceEventEmitter.emit('showToast', "任务已经在下载队列中了，请不要重复下载")
        return;
      } else if (this.allRunningTask.get(data.id).status == 2) {
        DeviceEventEmitter.emit('showToast', "您已经下载过该视频，请不要重复下载")
        return;
      }
    }

    if(this.allRunningTask.size >= 3){
      if(this.waitingTask.get(data.id)){
        DeviceEventEmitter.emit('showToast', "任务已经在下载队列中了，请不要重复下载")
        return;
      }
      data.status = 3;
      this.waitingTask.set(data.id, data);
      DeviceEventEmitter.emit('showToast', "任务同时下载3个，加入下载队列")
      return;
    }

    //查询本地已经下载成功的视频
    let videos = await queryDownloadVideoAll();
    let keys = Object.keys(videos)
    let localFile;
    for (let i = 0; i < keys.length; i++) {
      let obj = videos[keys[i]]
      if (obj && obj.id == data.id) {
        localFile = obj.file;
      }
    }
    console.log('localFile', localFile);

    if (localFile) {
      let flag = await fs.exists(localFile)
      if (flag) {
        DeviceEventEmitter.emit('showToast', "您已经下载过该视频，请不要重复下载")
        return;
      }
    }

    DeviceEventEmitter.emit('showToast', "开始下载...")

    //根据url获取到对应的本地目录
    let url = data.url;
    let urlSplits = url.split("/");

    console.log(urlSplits);

    let scheme = urlSplits[0];
    let baseUrl = urlSplits[2];
    let path = urlSplits.slice(3, urlSplits.length - 1).join("/")
    let fileName = urlSplits[urlSplits.length - 1]

    let toDirPath = baseFile + "/" + path;
    await fs.mkdir(toDirPath)
    let toFile = toDirPath + "/" + fileName;

    data.maxProgress = 100;
    data.progress = 0;
    data.status = 0;
    data.toFile = toFile;
    data.file = toFile;
    //添加m3u8下载任务到缓存
    this.allRunningTask.set(data.id, data)
    console.log('tofile', toFile);
    //开始下载m3u8文件
    let task = fs.downloadFile({
      fromUrl: url,
      toFile: toFile,
      connectionTimeout: 1000 * 60,
      readTimeout: 1000 * 60,
      begin: function (res) {
      },
      progress: function (res) {
      },
    });
    let task_key = fs.downloadFile({
      fromUrl: url.substring(0, url.lastIndexOf('index.m3u8'))+'key.key',
      toFile: toFile.substring(0, toFile.lastIndexOf('index.m3u8'))+'key.key',
      connectionTimeout: 1000 * 60,
      readTimeout: 1000 * 60,
      begin: function (res) {
      },
      progress: function (res) {
      },
    });
    console.log('index.m3u8', toFile);

    let result = await task.promise;
    let result_key = await task_key.promise;
    if (result.statusCode == 200 && result_key.statusCode == 200) {
      console.log('netlog-m3u8下载成功', toFile, url, result)
      console.log('baseFile, copy path', baseFile, baseFile + '/' + path.split('/')[1])
      let m3u8FileName = path.split('/')[1] + '.m3u8';
      let m3u8FilePath = baseFile + '/' + path.split('/')[1] + '.m3u8';
      let m3u8TempFilePath = baseFile + '/' +path.split('/')[1] +'_.m3u8';
      let tsDir = baseFile + '/' + path.split('/')[0] + '/' + path.split('/')[1];
      fs.exists(baseFile + '/mp4/').then(exists => {
        if (!exists) {
          fs.mkdir(baseFile + '/mp4/')
        }
      })

      console.warn('tempfilepath', m3u8TempFilePath);

      await fs.exists(baseFile + '/' + m3u8FileName).then(exists => {
        if (!exists) {
          let resultCopy = fs.copyFile(toFile, baseFile + '/' + m3u8FileName);
        }
      })
      console.warn('resultCopy',baseFile + '/' + m3u8FileName);

      let resultM3u8 = await fs.readFile(baseFile + '/' + m3u8FileName);
      console.warn('result111Copy',baseFile + '/' + m3u8FileName);

      let lines = resultM3u8.split('\n');
      let lineTemp = '';
      for (let line of lines) {
        //console.log(line);
        if (line.endsWith('.jpg') || line.indexOf("jpg") > -1) {
          line = '.'+ line;

          //console.log('line, write line',line);
        }
        if (line.endsWith('.key') || line.indexOf(".key") > -1) {
          line = line.substring(0, line.indexOf('/')) + '.' + line.substring(line.indexOf('/'));

          //console.log('line, write line',line);
        }
        lineTemp = lineTemp + line + '\n';
      }

      await fs.writeFile(m3u8TempFilePath, lineTemp);
      try {
        //m3u8下载成功,开始逐步下载ts文件
        console.warn('readm3u8file');
        await this.readM3U8File(data, url, toFile, toDirPath)
        console.log('netlog-', '所有ts文件都下载成功了')
        //合并ts分片

        //标记下载成功
        this.allRunningTask.get(data.id).status = 2;
        //写入本地数据库
        await writeDownloadVideo(data)
        console.log('netlog-', '插入本地数据库成功了')

        //删除ts分片
//        let m3u8DelResult = await fs.unlink(tsDir);
//        console.log('delete m3u8dir', m3u8DelResult);
        //删除内存中缓存
        this.allRunningTask.delete(data.id)
        //let m3u8DelResult = await fs.unlink(tsDir);

        DeviceEventEmitter.emit('showToast', data.title + "下载成功了,请到下载中心查看")
        //通知出去
        this._updatelisteners()
        console.log('this.waitingTask.size', this.waitingTask.size);
        if(this.waitingTask.size > 0){
          let continueKey = this.waitingTask.keys().next();
          console.log('continueKey', continueKey);
          let downloadData = this.waitingTask.get(continueKey.value);
          console.log('downloadData', downloadData);
          this.waitingTask.delete(continueKey.value);
          this.startDownloadM3U8(downloadData);
        }
      } catch (error) {
        DeviceEventEmitter.emit('showToast', "哎哟，下载出现了异常", error)
        console.log('netlog-', '哎哟，下载出现了异常', error)
        this.allRunningTask.get(data.id).status = -1;
        //通知出去
        this._updatelisteners()
      }
    } else {
      console.log('哎哟，下载出现了异常')
      DeviceEventEmitter.emit('showToast', "哎哟，下载出现了异常")
      this.allRunningTask.get(data.id).status = -1;
      //通知出去
      this._updatelisteners()

    }
  }


  /**
   * 读取m3u8对应的内容，获取到对应的ts文件地址
   * @param {*} m3u8Url
   * @param {*} m3u8File
   * @param {*} m3u8Dir
   */
  async readM3U8File(data, m3u8Url, m3u8File, m3u8Dir) {
    let result = await fs.readFile(m3u8File)
    let lines = result.split('\n');
    console.log('read line');
    let tsUrls = [];
    for (let line of lines) {
      if (line.endsWith('.jpg') || line.indexOf("jpg") > -1) {
        tsUrls.push(line)
      }
    }
    //设置最大进度，默认为ts文件数为单位
    this.allRunningTask.get(data.id).maxProgress = tsUrls.length;
    //开始下载ts文件
    await this.startDownloadTS(data, m3u8Url, tsUrls, 0, m3u8Dir);
  }

  /**
   * 开始下载ts文件
   * @param {*} m3u8Url
   * @param {*} tsUrls
   * @param {*} index
   * @param {*} m3u8Dir
   */
  async startDownloadTS(data, m3u8Url, tsUrls, index, m3u8Dir) {
    //console.log('tsUrls.length',tsUrls.length);
    if (index >= tsUrls.length) {
      return;
    };
    // if (index >= 10) {
    //   return;
    // };

    let url = tsUrls[index];
    //console.log('hass /?', url.lastIndexOf("/"));

    //如果ts文件中包含路径，当文件夹形式处理
    //console.warn('Uuuurl',url);
    if (url.lastIndexOf("/") > -1) {
      let targetDir = baseFile + url.substring(0, url.lastIndexOf('/'));
      //console.warn('targetDir'+targetDir);
      let exists = await fs.exists(targetDir)
      //console.warn('exists'+exists);

      if (!exists) {
        await fs.mkdir(targetDir)
      }
    }

    let downloadUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf("/") + 1) + url.substring(url.lastIndexOf('/')+1);
    //console.log('TS分片url', downloadUrl)

    //console.warn('TS分片url', url.substring(url.lastIndexOf('/')+1))
    let toFile = baseFile + url;
    //console.warn('toFile',toFile);

    let tofile_exists = await fs.exists(toFile);
    //console.warn('toFile_exists',tofile_exists);
    if(!tofile_exists){
      //console.log('toFile_exists', tofile_exists);

      console.log('缓存位置tt',downloadUrl, toFile);

      let result = await this.createDownloadTSPromise(downloadUrl, toFile)
      //console.log('moveFilename', toFile.substring(0, toFile.lastIndexOf('.jpg')) + '.ts')
      //console.log('netlog-ts下载成功了', toFile, downloadUrl, result)
    }
    //刷新进度
    this.allRunningTask.get(data.id).progress = index + 1;
    //通知出去
    this._updatelisteners()
    //console.warn('netlog-ts next', );

    await this.startDownloadTS(data, m3u8Url, tsUrls, index + 1, m3u8Dir)
  }

  /**
   * 创建ts下载任务
   * @param {*} url
   * @param {*} file
   */
  createDownloadTSPromise(url, file) {
    let task = fs.downloadFile({
      fromUrl: url,
      toFile: file,
      connectionTimeout: 1000 * 60,
      readTimeout: 1000 * 60,
      begin: function (res) {
      },
      progress: function (res) {
      },
    });
    return task.promise
  }

}

const DownloadManagerInstance = new DownloadManager()

export default DownloadManagerInstance;

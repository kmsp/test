import RNFetchBlob from 'rn-fetch-blob';
import { queryDownloadVideoAll, writeDownloadVideo, deleteDownloadVideo } from '../util/DButils'
import DeviceStorage from "../util/DeviceStorage";
import {DeviceEventEmitter} from "react-native";
//import Loadding from '../common/Loadding'

import DownloadManager from "../util/DownloadManager"



let videocache = '';        //建立视频主目录
let urlLast = '';           //下载地址除去最后一个/的相对地址
let urlDomain = '';         //下载地址的域名

let hasDown = 0;            //已经下载的数据（计算进度）
let allDown = 0;            //需要下载的数据（计算进度）

let movieId = 0;            //电影ID
let movieUrl = '';          //电影链接
let movieTitle = '';        //电影标题
let moviePic = '';           //电影图片
/**
 *
 * @param id        影片ID
 * @param url       下载地址
 * @constructor
 */
export async function DownloadVideo(id,url,title,pic) {
    //缓存路径
    videocache = RNFetchBlob.fs.dirs.DocumentDir+'/'+id;
    movieId = id;
    movieUrl = url;
    movieTitle = title;
    moviePic = pic;
    let isDir=await RNFetchBlob.fs.isDir(videocache);

    if(!isDir){
        await RNFetchBlob.fs.mkdir(videocache)
            .then(() => {

            })
            .catch((err) => {
                alert(err)
            })
    }
//测试用例

    const data_test = {
      id:movieId,
      url:movieUrl,
      title:movieTitle,
      index:0,
      coverUrl:moviePic,
      file:'test',
      playCount:1304,
      imdbScore:0,
      director:'test',
      staring:'test',
      intro:'test',
      type:0,
      classifyTypeListValue:'test',

    }


    await writeDownloadVideo(data_test);
    let videos = await queryDownloadVideoAll();
    let keys = Object.keys(videos)
    console.log(videos)
    let length = videos.length;
    DeviceEventEmitter.emit('showToast','开始下载请'+data_test.url);


    DownloadManager.downLoad(data_test);

}

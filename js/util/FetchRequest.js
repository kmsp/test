/**
 * 请求头
 * @type {{Accept: string, Content-Type: string}}
 */

import CryptoJS from "crypto-js"

const header = {
    // 'Accept': 'application/json',
    'Content-Type': 'application/json',
};

function _aesDecrypt (decrytText){
    if(decrytText==""){
    return decrytText;
    }
    let IV = 'OV1xTfizP4DRKAfP';
    let KEY = 'Y5NbvPlSTqNRUWVv';
    let key = CryptoJS.enc.Utf8.parse(KEY);
    let iv = CryptoJS.enc.Utf8.parse(IV);
    let decrypted = CryptoJS.AES.decrypt(decrytText,key,{iv:iv,padding:CryptoJS.pad.Pkcs7});
    let decstr = decrypted.toString(CryptoJS.enc.Utf8);
    let decJson = JSON.parse(decstr);

    return decJson;
}

function _aesEncrypt(_aesEncrypt) {
    let IV = 'OV1xTfizP4DRKAfP';
    let KEY = 'Y5NbvPlSTqNRUWVv';
    let key = CryptoJS.enc.Utf8.parse(KEY);
    let iv = CryptoJS.enc.Utf8.parse(IV);
    let encrypted = CryptoJS.AES.encrypt(_aesEncrypt,key,{iv:iv,mode:CryptoJS.mode.CBC,padding:CryptoJS.pad.Pkcs7});
    return encrypted.toString();
}

/**
 * 注意这个方法前面有async关键字
 * @param url  请求地址
 * @param body 请求参数
 * @param method 请求方法 大写
 * @param successCallBack  网络请求成功的回调
 * @param errorCallBack    出错的回调
 * @returns {Promise.<*>}
 */
export function FetchRequest(url, method, body, successCallBack: func, errorCallBack: func) {
    // console.log('reqyestUrl:' + url);
    // console.log('reqyestMethod:' + method);
    // console.log('reqyestBody:' + JSON.stringify(body));
    if ('GET' === method) {
        get(url, body, successCallBack, errorCallBack);
    }
    else if('ENCRYPTO' === method){
        encrypto(url, body, successCallBack, errorCallBack);
    }else{
        post(url, body, successCallBack, errorCallBack);
    }
}

/**
 * get请求
 */
async function get(url, body, successCallBack, errorCallBack) {
    let str = toQueryString(body);
    if (str && str.length > 0) url += '?' + str;
    try {
        // 注意这里的await语句，其所在的函数必须有async关键字声明
        let response = await fetch(url);
        let responseJson = await response.json();

        return successCallBack(responseJson);
    } catch (error) {
        return errorCallBack(error);
        //console.error(error);
    }
}

/**
 * post请求
 */
async function post(url, body, successCallBack, errorCallBack) {
    try {

        // 注意这里的await语句，其所在的函数必须有async关键字声明
        let response = await fetch(url, {
            method: 'POST',
            headers: header,
            body: JSON.stringify(body),
            timeout:10
        });

        let responseJson = await response.json();

        return successCallBack(responseJson);
    } catch (error) {
        return errorCallBack(error);
    }
}

async function encrypto(url, body, successCallBack, errorCallBack) {
    try {


        // 注意这里的await语句，其所在的函数必须有async关键字声明
        let response = await fetch(url, {
            method: 'POST',
            headers: header,
            body: JSON.stringify(body),
        });
        let responseJson = await response.text();
        console.log('enc body',body)
        console.log('enc url',url)
        console.log('responseJson',responseJson)


        return successCallBack(_aesDecrypt(responseJson));
    } catch (error) {
      if (error instanceof SyntaxError) {
        // statements to handle EvalError exceptions
        return successCallBack(responseJson);
      } else {
        console.log('error',error)
        return errorCallBack(error);
      }
    }
}


/**
 * 用于对对象编码以便进行传输
 * @param obj 对象参数
 * @returns {string} 返回字符串
 */
function toQueryString(obj) {
    let str = '';
    if (obj) {
        let keys = [];
        for (let key in obj) {
            keys.push(key);
        }
        keys.forEach((key, index) => {
            str += key + '=' + obj[key];
            if (index !== keys.length - 1) {
                str += '&';
            }
        });
    }
    return str;
}

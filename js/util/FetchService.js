import React, {Component} from  'React';

export default class FetchService {

    static get(url){
        fetch(url+'&account='+account )
            .then(response => response.json())
            .then(responseJson => {
                if (responseJson.code === '200'){
                    return responseJson.data;
                } else {
                    return '请求失败';
                }
            })
            .catch(error => {
                return error;
            });
    }

}
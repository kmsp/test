import {Dimensions, ImageBackground, Linking, StyleSheet, Text, TouchableOpacity, View, Image} from "react-native";
import React, {Component} from "react";
import FastImage from 'react-native-fast-image';
import Theme from "react-native-theming";


const { width, height } = Dimensions.get('window');

export default class MoveItemSon extends Component {

    constructor(props){
        super(props);
        this.state={
            is_like:this.props.is_like,
        }
    }

    //计算更新时间
    _GetDateTimeDiff(startTime) {
        var date = new Date();
        var now_time = date.getTime() / 1000;
        startTime = parseInt(startTime);
        var date3 = now_time - startTime;  //时间差的毫秒数
        //计算出相差天数
        var days = Math.floor(date3 / (24 * 3600));
        var years = Math.floor(days / 365);
        var months = Math.floor(days / 30);
        //计算出小时数
        var leave1 = date3 % (24 * 3600);    //计算天数后剩余的毫秒数
        var hours = Math.floor(leave1 / (3600));
        //计算相差分钟数
        var leave2 = leave1 % (3600);        //计算小时数后剩余的毫秒数
        var minutes = Math.floor(leave2 / (60));

        var strTime = "";
        if (years >= 1) {
            strTime = years + "年前";
        } else if (months >= 1) {
            strTime = months + "个月前";
        } else if (days >= 1) {
            strTime = days + "天前";
        } else if (hours >= 1) {
            strTime = hours + "小时前";
        } else {
            strTime = minutes + "分钟前";
        }
        return strTime;
    }

    //收藏
    _collection(item){
        if (this.state.is_like === 1 ){
            this.setState({is_like:0});
        } else {
            this.setState({is_like:1});
        }
        FetchRequest(
            global.ActiveDomain+"Favorite_movie",
            "ENCRYPTO",
            {
                m_id: item.id,
                account: global.UniqueId,
            }
        );

    }

    //点击广告
    _clickAd(item){
        FetchRequest(
            global.ActiveDomain+"Advertising_records",
            "ENCRYPTO",
            {
                a_id: item.id,
                account: global.UniqueId,
            },
            (responseJson) => {
                if (responseJson.code === 200){

                    Linking.openURL(item.url)

                }else{
                }
            },
            (error) => {
                console.error(error);
            })

    }

    render(){
        const item = this.props.item;
        return(
            item.is_ad === 0 ?
                <TouchableOpacity key={item.id.toString()} activeOpacity={1} onPress={() => {
                    this.props.navigation.goBack();
                    this.props.navigation.navigate('MoveDetail',{tabId: item.id})
                }}>
                    <View style={styles.itemson}>
                        <FastImage style={{height:((width-30)/2)*0.667,width:(width-30)/2,backgroundColor:'#eee',borderRadius:5}} source={{uri:((item.img).startsWith('http') ? item.img : global.ActiveDomain + item.img)}} resizeMode={'cover'} resizeMethod={'resize'} />
                        <View style={styles.outermost}>
                            <View style={styles.top}>
                                {item.vip === 2 ?
                                    <View style={{backgroundColor:'#f4bd3f',paddingHorizontal: 10,height:20,borderRadius:5}}>
                                        <Text style={{color:'#fff',fontSize:12,margin:0,lineHeight: 20}}>限免</Text>
                                    </View>
                                    :
                                    <View style={{backgroundColor:'#7D3ED3',paddingHorizontal: 10,height:20,borderRadius:5}}>
                                        <Text style={{color:'#fff',fontSize:12,margin:0,lineHeight: 20}}>VIP</Text>
                                    </View>
                                }
                                <TouchableOpacity onPress={()=>this._collection(item)}>
                                    {this.state.is_like === 1 ?
                                        <Image source={require('../../res/images/common/collect_select.png')} style={styles.collect} />
                                        :
                                        <Image source={require('../../res/images/common/collect.png')} style={styles.collect} />
                                    }
                                </TouchableOpacity>
                            </View>
                            <View style={styles.bottom}>
                                <View style={styles.bottomleft}>
                                    <Image source={require('../../res/images/common/hot.png')} style={styles.bottomimg} /><Text style={styles.font}>{item.zan_lv}%</Text>
                                </View>
                                <View style={styles.bottomright}><Image source={require('../../res/images/common/date.png')} style={styles.bottomimg} /><Text style={styles.font}>{this._GetDateTimeDiff(item.c_time)}</Text></View>
                                <View style={styles.bottomright}><Text style={styles.font}>{item.time}</Text></View>
                            </View>
                        </View>
                        <Theme.Text style={{marginTop:5,textAlign:'left',fontSize: 12,color:'@TextColor'}} numberOfLines={2}>{item.title}</Theme.Text>
                    </View>
                </TouchableOpacity>
                :
                <TouchableOpacity key={item.id.toString()} activeOpacity={1} onPress={() => this._clickAd(item)} >
                    <View style={styles.itemson}>
                        <ImageBackground style={{height:((width-30)/2)*0.667,width:(width-30)/2,margin:0}} source={{uri:((item.img).startsWith('http') ? item.img : global.ActiveDomain + item.img)}} resizeMode='cover'>
                        </ImageBackground>
                        <Theme.Text style={{marginTop:5,textAlign:'left',fontSize: 12,color:'@TextColor'}} numberOfLines={2}>{item.des}</Theme.Text>
                    </View>
                </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff',
    },

    itemson:{
        width: (width-30)/2,
        height: ((width-30)/2)*0.667 + 32,
        paddingBottom: 0,
        marginTop:10,
        marginLeft: 10,
        position: 'relative'
    },
    outermost:{
        flex:1,
        flexDirection:'column',
        position:'absolute',
        top:0,
        height:((width-30)/2)*0.667,
        width:(width-30)/2
    },
    top:{
        flex:1,
        flexDirection:'row',
        justifyContent: 'space-between'
    },
    collect:{
        width:30,
        height:30,
        marginRight: 5,
        marginTop:5,
    },
    bottom:{
        backgroundColor:'#000',
        opacity:0.7,
        height:20,
        flexDirection: 'row',
        borderRadius:5
    },
    bottomleft:{
        flex:1,
        flexDirection: 'row',
    },
    bottomright:{
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginRight: 4,
    },
    font:{
        fontSize:10,
        color:'#fff',
        lineHeight:20,
    },
    bottomimg:{
        height:12,
        width:12,
        margin:4,
    },
});

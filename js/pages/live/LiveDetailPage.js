import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    Dimensions,
    TouchableOpacity,
    Linking
} from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome5";
import Theme, {createThemedComponent} from "react-native-theming";
import FastImage from 'react-native-fast-image';
import IdleTimerManager from 'react-native-idle-timer';
import KSYVideo from 'react-native-ksyvideo';
import Orientation from 'react-native-orientation';
import {FetchRequest} from "../../util/FetchRequest";


const MdTouchableOpacity = createThemedComponent(TouchableOpacity);
const MdSafeAreaView = createThemedComponent(SafeAreaView);
const deviceInfo = {
    deviceWidth: Dimensions.get('window').width,
    deviceHeight: Dimensions.get('window').height,
};
export default class LiveDetailPage extends Component{

    constructor(props){
        super(props);
        this.state={
            AdData1:[],
            AdData2:[],
            AdData3:[],
            AdPower:0,
            MovieDetail:this.props.navigation.getParam('Ptitle'),
            isLoading:true,
            lookTime:0,
            paused:false
        };

        //隐藏底部导航栏
        this.props.navigation.setParams({
            fullscreen: false,
        })
    }

    componentWillMount(){
        //强制竖屏
        Orientation.lockToPortrait();
        //直播会员判断
        if (global.UserVip !== 0){
            this.lookTime && clearInterval(this.lookTime);
        }else {
            if(global.isShiKan == 1){
                this.lookTime = setInterval(()=>{
                    if (this.state.lookTime <= 30) {
                        this.setState({
                            lookTime:this.state.lookTime+1
                        })
                    }else{
                        this.setState({paused:true});
                        this.lookTime && clearInterval(this.lookTime);
                        //Todo 提示更新
                        Alert.alert(
                            '温馨提示',
                            '开通会员可继续观看，是否开通？',
                            [
                                {text: '取消', onPress: () => {
                                        this.props.navigation.goBack();
                                    }},
                                {text: '确定', onPress: () => {
                                        this.props.navigation.goBack();
                                        this.props.navigation.navigate('MyPage');
                                        this.props.navigation.navigate('VipShowPage')
                                    }},
                            ],
                            { cancelable: false }
                        )
                    }
                },1000);
            }else{
                this.lookTime && clearInterval(this.lookTime);
                Alert.alert(
                    '温馨提示',
                    '开通会员才可观看',
                    [
                        {text: '取消', onPress: () => {
                                this.props.navigation.goBack();
                            }},
                        {text: '确定', onPress: () => {
                                this.props.navigation.goBack();
                                this.props.navigation.navigate('MyPage');
                                this.props.navigation.navigate('VipShowPage')
                            }},
                    ],
                    { cancelable: false }
                )
            }
        }
    }

    componentDidMount() {
        // this.player.initialize();
        //获取广告数据
        this._getAdData1();
        this._getAdData2();
        this._getAdData3();
        //屏幕常亮打开
        IdleTimerManager.setIdleTimerDisabled(true);
    }

    componentWillUnmount() {
        //强制竖屏
        Orientation.lockToPortrait();
        //清除计时器
        this.lookTime && clearInterval(this.lookTime);
        //屏幕常亮关闭
        IdleTimerManager.setIdleTimerDisabled(false);
    }

    //获取广告
    _getAdData1() {
        fetch(global.ActiveDomain+"/adconfig", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id:"7"

            })
        })
            .then(response => response.json())
            .then(responseJson => {
                this.setState({
                    AdData1:responseJson.data[0],
                });

                // return responseJson.data;
                // alert(this.state.AdData.img);
            })
            .catch(error => {
                Alert.alert(
                    '温馨提示',
                    '数据获取异常，请检查网络，code'+error,
                    [
                        {text: '返回'},
                    ],
                    { cancelable: false }
                )
            });
    };

    //获取广告
    _getAdData2() {
        fetch(global.ActiveDomain+"/adconfig", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id:"9"

            })
        })
            .then(response => response.json())
            .then(responseJson => {
                this.setState({
                    AdData2:responseJson.data[0],
                });

                // return responseJson.data;
                // alert(this.state.AdData.img);
            })
            .catch(error => {
                console.error(error);
                Alert.alert(
                        '温馨提示',
                        '数据获取异常，请检查网络，code'+error,
                        [
                            {text: '返回'},
                        ],
                        { cancelable: false }
                    )
            });
    };

    //获取广告
    _getAdData3() {
        fetch(global.ActiveDomain+"/adconfig", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id:"10"

            })
        })
            .then(response => response.json())
            .then(responseJson => {
                this.setState({
                    AdData3:responseJson.data[0],
                });

                // return responseJson.data;
                // alert(this.state.AdData.img);
            })
            .catch(error => {
                console.error(error);
                Alert.alert(
                        '温馨提示',
                        '数据获取异常，请检查网络，code'+error,
                        [
                            {text: '返回'},
                        ],
                        { cancelable: false }
                    )
            });
    };

    //点击广告
    _clickAd(item){
        FetchRequest(
            global.ActiveDomain+"/Advertising_records",
            "ENCRYPTO",
            {
                a_id: item.id,
                account: global.UniqueId,
            },
            (responseJson) => {
                if (responseJson.code === 200){
                    Linking.openURL(item.url)
                }else{
                    Alert.alert(
                        '温馨提示',
                        '请重试点击广告',
                        [
                            {text: '返回'},
                        ],
                        { cancelable: false }
                    )
                }
            },
            (error) => {
                Alert.alert(
                        '温馨提示',
                        '请重试点击广告',
                        [
                            {text: '返回'},
                        ],
                        { cancelable: false }
                    )
                console.error(error);
            }

        )

    };

    //广告开关
    _AdPower(id){
        this.setState({
            AdPower:id
        })
    }

    render(){
        let width = deviceInfo.deviceWidth;
        let height = deviceInfo.deviceHeight;
        return(
            <MdSafeAreaView style={{flex:1,backgroundColor:'@BackgroundColor'}} forceInset={{ bottom: 'never' }}>
                <Theme.View style={[styles.navBar,{backgroundColor:'@HeadColor'}]}>
                    <Icon onPress={()=>this.props.navigation.goBack()} name='chevron-left' style={styles.navBarIcon} />
                    <Text style={styles.navBarText}>{this.props.navigation.getParam('Ptitle')}</Text>
                </Theme.View>
                <View style={{flex:1,backgroundColor:'#000'}}>
                    <View style={{width:width /2.4,height:width /10,marginLeft: 3,borderRadius:20,marginTop:20,position: 'absolute',top:0,flexDirection: 'row',padding: 2,alignItems: 'center',zIndex: 100,backgroundColor:'rgba(0,0,0,0.4)'}}>
                        <FastImage source={{uri:this.props.navigation.getParam('Pphoto')}} style={{width: 35,height: 35,borderRadius:20}} resizeMode={'cover'} />
                        <View style={{flex:1,marginLeft: 10,justifyContent: 'space-between',height:width /12}}>
                            <Theme.Text style={{width:width /4,color:'#FFF',padding:0,margin: 0}} numberOfLines={1}>{this.props.navigation.getParam('Ptitle')}</Theme.Text>
                            <Theme.Text style={{color:'#FFF',padding:0,margin: 0,fontSize:10,}}>{this.props.navigation.getParam('Pnum')}人在线</Theme.Text>
                        </View>
                    </View>
                    {
                        this.state.AdData1.des ?
                            this.state.AdPower === 0 ?
                                <View style={{height:width /18,marginLeft: 3,borderRadius:10,marginTop:(width /10)+30,position: 'absolute',top:0,flexDirection: 'row',padding: 2,alignItems: 'center',zIndex: 100,backgroundColor:'rgba(0,0,0,0.5)'}}>
                                    <TouchableOpacity activeOpacity={1} onPress={()=>this._clickAd(this.state.AdData1)}>
                                        <View style={{flex:1,marginLeft: 3,justifyContent: 'space-between',height:width /12}}>
                                            <Theme.Text style={{color:'#FFF',padding:0,margin: 0,fontSize:12}} numberOfLines={1}>{this.state.AdData1.des}</Theme.Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            :
                            null
                        :
                        null

                    }

                    {
                        this.state.AdData2.des ?
                            this.state.AdPower === 0 ?
                                <View style={{height:width /18,marginLeft: 3,borderRadius:10,marginTop:(width /10)+35+(width /18),position: 'absolute',top:0,flexDirection: 'row',padding: 2,alignItems: 'center',zIndex: 100,backgroundColor:'rgba(254,67,101,0.5)'}}>
                                    <TouchableOpacity activeOpacity={1} onPress={()=>this._clickAd(this.state.AdData2)}>
                                        <View style={{flex:1,marginLeft: 3,justifyContent: 'space-between',height:width /12}}>
                                            <Theme.Text style={{color:'#FFF',padding:0,margin: 0,fontSize:12}} numberOfLines={1}>{this.state.AdData2.des}</Theme.Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            :
                            null
                        :
                        null

                    }

                    {
                        this.state.AdData3.des ?
                            this.state.AdPower === 0 ?
                                <View style={{height:width /18,marginLeft: 3,borderRadius:10,marginTop:(width /10)+40+(width /18)+(width /18),position: 'absolute',top:0,flexDirection: 'row',padding: 2,alignItems: 'center',zIndex: 100,backgroundColor:'rgba(254,67,101,0.5)'}}>
                                    <TouchableOpacity activeOpacity={1} onPress={()=>this._clickAd(this.state.AdData3)}>
                                        <View style={{flex:1,marginLeft: 3,justifyContent: 'space-between',height:width /12}}>
                                            <Theme.Text style={{color:'#FFFF66',padding:0,margin: 0,fontSize:12}} numberOfLines={1}>{this.state.AdData3.des}</Theme.Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            :
                            null
                        :
                        null

                    }
                    {
                        this.state.AdPower === 0 ?
                            <View style={{marginLeft: width - 60,borderRadius:10,marginTop:20,position: 'absolute',top:0,flexDirection: 'row',padding: 5,alignItems: 'center',zIndex: 100,backgroundColor:'rgba(0,0,0,0.4)'}}>
                                <TouchableOpacity activeOpacity={1} onPress={()=>this._AdPower(1)}>
                                    <View style={{flex:1,marginLeft: 0,justifyContent: 'space-between'}}>
                                        <Theme.Text style={{color:'#FFFF66',padding:0,margin: 0,fontSize:12}} numberOfLines={3}>关闭广告</Theme.Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        :
                            <View style={{marginLeft: width - 60,borderRadius:10,marginTop:20,position: 'absolute',top:0,flexDirection: 'row',padding: 5,alignItems: 'center',zIndex: 100,backgroundColor:'rgba(0,0,0,0.4)'}}>
                                <TouchableOpacity activeOpacity={1} onPress={()=>this._AdPower(0)}>
                                    <View style={{flex:1,marginLeft: 0,justifyContent: 'space-between'}}>
                                        <Theme.Text style={{color:'#FFFF66',padding:0,margin: 0,fontSize:12}} numberOfLines={3}>打开广告</Theme.Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                    }


                    <View style={{flex:1}}>
                        <KSYVideo source={{uri: this.props.navigation.getParam('Url')}}   // Can be a URL or a local file.
                                  ref={(ref) => {
                                      this.player = ref
                                  }}                                      // Store reference

                                  volume={1.0}
                                  muted={false}
                                  paused={this.state.paused}                          // Pauses playback entirely.
                                  resizeMode="contain"                      // Fill the whole screen at aspect ratio.*
                                  repeat={true}                           // Repeat forever.
                                  playInBackground={false}                // Audio continues to play when app entering background.
                                  progressUpdateInterval={250.0}          // Interval to fire onProgress (default to ~250ms)
                                  // onLoadStart={this.loadStart}            // Callback when video starts to load
                                  onLoad={()=>this.setState({isLoading:false})}               // Callback when video loads
                                  // onProgress={this.setTime}               // Callback every ~250ms with currentTime
                                  // onEnd={this.onEnd}                      // Callback when playback finishes
                                  // onError={this.videoError}               // Callback when video cannot be loaded
                                  // onBuffer={this.onBuffer}                // Callback when remote video is buffering
                                  style={{flex:1}} />
                    </View>
                    {
                        this.state.isLoading ?
                            <View style={{alignItems:'center', justifyContent: 'center',position:'absolute',bottom:0,right:0,top:0,left: 0}}>
                                <ActivityIndicator
                                    animating={true}
                                    color='#FFF'
                                    size="large"
                                />
                            </View>
                            : null
                    }
                </View>
            </MdSafeAreaView>
        )
    }

}

const styles=StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    //顶部navBar样式
    navBar: {
        height: 44,
        width:'100%',
    },
    navBarIcon:{
        fontSize:25,
        position: 'absolute',
        left:0,
        top:0,
        marginLeft:15,
        color:'#000',
        lineHeight:44
    },
    navBarText:{
        color:'#000',
        textAlign:'center',
        alignSelf:'center',
        lineHeight:44,
        fontSize: 18,
        width:'80%',
    },

    txtTitle:{
        color:'#fff',
        textAlign:'center',
        fontSize:14,
        lineHeight:18
    },
    txtContent:{
        color:'#fff',
        fontSize:12,
        lineHeight:16
    }

});

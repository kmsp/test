import React from 'react';
import {
    View,
    Text,
    Image,
    Slider,
    Dimensions,
    Linking,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    DeviceInfo,
    Platform,
    PanResponder,
    ActivityIndicator
} from 'react-native';
import PropTypes from 'prop-types';
import Video from 'react-native-video';
import Orientation from "react-native-orientation";
import SystemSetting from 'react-native-system-setting';
import FastImage from 'react-native-fast-image';
import {FetchRequest} from "../util/FetchRequest";


export default class VideoPlayer extends React.Component {

    static propTypes = {
        onChangeOrientation: PropTypes.func,
        onTapBackButton: PropTypes.func,
        onClickBuyVip:PropTypes.func
    };

    static defaultProps = {
        videoWidth: screenWidth,    // 默认视频宽度，竖屏下为屏幕宽度
        videoHeight: defaultVideoHeight, // 默认视频高度，竖屏下为宽度的9/16，使视频保持16：9的宽高比
        videoID:'',       //视频ID（用于提交记录）
        videoCurrentTime:0,     //视频历史播放起点
        videoURL: '',    // 视频的地址
        videoCover: '',  // 视频的封面图地址
        videoTitle: '',  // 视频的标题
        enableSwitchScreen: true, // 是否允许视频切换大小
        tag: 0,
        isShiKan:'',    //是否属于试看
        isVip:0,       //是否是VIP视频
    };

    constructor(props) {
        super(props);
        let hasCover = true;
        if (this.props.videoCover == null || this.props.videoCover === '') {
            hasCover = false;
        }
        this.state = {
            x: 0,
            videoWidth: screenWidth,
            videoHeight: defaultVideoHeight,
            videoID:this.props.videoID,
            videoCurrentTime:this.props.videoCurrentTime,
            videoUrl: this.props.videoURL,
            videoCover: this.props.videoCover,
            videoTitle: this.props.videoTitle,
            ad1:this.props.ad1,
            hasCover: hasCover, // 是否有视频封面
            isPaused: true,  // 是否暂停，控制视频的播放和暂停
            isLoading:true,
            showIndexAdTime:0,
            duration: 0,     // 视频的时长
            currentTime: 0,  // 视屏当前播放的时间
            isFullScreen: false, // 是否全屏
            isShowControl: false, // 是否显示播放的工具栏
            isShowVideoCover: hasCover, // 是否显示视频封面
            playFromBeginning: false, // 视频是否需要从头开始播放
            isMuted: false,  // 是否静音
            volume: 1.0,   // 音量大小
            brightness:1,  //系统亮度
            playRate: 1.0, // 播放速率
            lastSingleTapTime: 0,   //上次单点击视频区域的时间
            isDefinitionShow: false, // 是否显示清晰度切换界面
            isVideoListShow: false,  // 是否显示选集界面
            isShareMenuShow: false,  // 是否显示分享界面
            isSettingViewShow: false, // 是否显示设置界面
            dyLast: 0,              //上次Dy值
            value:0,
            isShowVolume:false,     //显示音量滑动
            isShowBrightness:false,     //显示亮度滑动
            isShowDuration:false,     //显示快进滑动
            ShowDurationIco:true,     //显示快进滑动图片
            panResType:0,
        }
    }

    componentWillMount() {
        this._panResponder = PanResponder.create({
            // 要求成为响应者：
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

            onPanResponderGrant: this.onPanResponderGrant,
            onPanResponderMove: this.onPanResponderMove,
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderRelease: this.onPanResponderRelease,
            onPanResponderTerminate: (evt, gestureState) => {
                // 另一个组件已经成为了新的响应者，所以当前手势将被取消。
            },
            onShouldBlockNativeResponder: (evt, gestureState) => {
                // 返回一个布尔值，决定当前组件是否应该阻止原生组件成为JS响应者
                // 默认返回true。目前暂时只支持android。
                return true;
            },
        });
        //获取系统音量
        SystemSetting.getVolume().then((volume)=>{
            this.setState({
                volume:volume
            })
        });
        //获取系统亮度
        SystemSetting.getAppBrightness().then((brightness)=>{
            this.setState({
                brightness:brightness
            })
        })
    }

    componentDidMount(){
        //首屏广告倒计时
        if(this.state.isShowVideoCover){
            this.VideoAdTime = setInterval(()=>{
                if (this.state.showIndexAdTime > 0) {
                    this.setState({
                        showIndexAdTime:this.state.showIndexAdTime-1
                    })
                }else{
                    clearInterval(this.VideoAdTime);
                    this.setState({
                        isPaused:false,
                        isShowVideoCover:false
                    })
                }
            },1000);
        }
    }

    componentWillUnmount() {
        this.timer&&clearTimeout(this.timer);
        clearInterval(this.VideoAdTime);
        //提交观看记录
        this._doHistory();
    }

    componentWillReceiveProps(nextProps){
        this.setState({videoUrl: nextProps.videoURL,})
    }

    //添加记录
    _doHistory(){
        if (this.state.currentTime > 0 && this.props.isVip !== 0){
            FetchRequest(
                global.ActiveDomain+"/History_add",
                "ENCRYPTO",
                {
                    m_id: this.state.videoID,
                    time:this.state.currentTime,
                    account: global.UniqueId,
                }
            );
        }
    }

    //手势
    onPanResponderGrant = () => {
        this.$currentTime = this.state.currentTime;
        this.$duration = this.state.duration;
        this.$panResType = this.state.panResType;
    }

    liangdu = (gestureState) => {
      //亮度
      if (Math.abs(gestureState.x0) < (this.state.videoWidth/2) && Math.abs(gestureState.dy) > 5 && Math.abs(gestureState.dx)<15 || this.$panResType == 1) {
          this.$isShowBrightness = true;
          this.$panResType = 1;
          let upordown =gestureState.dy-this.state.dyLast;
          let value;
          if(upordown>0){
              value = this.state.brightness-(gestureState.moveY/this.state.videoHeight)*.05
          }else if(upordown<0){
              value = this.state.brightness+(gestureState.moveY/this.state.videoHeight)*.05
          }
          console.log('value',value)
          this.setState({
            dyLast:gestureState.dy,
          })
          if (value < 0){
              value = 0;
          }
          if (value >1){
              value = 1;
          }
          if(upordown!=0){
            SystemSetting.setAppBrightness(value);
            this.setState({
                brightness:value,
                isShowBrightness:true,     //显示亮度滑动
            });
          }
      }else{
          this.$isShowBrightness = false;
      }
    }

    yinliang = (gestureState) => {
      //音量
      if (Math.abs(gestureState.x0) > (this.state.videoWidth/2) && Math.abs(gestureState.dy) > 5 && Math.abs(gestureState.dx)<15 || this.$panResType == 2) {

          //console.log('gesState dy',(gestureState.dy/this.state.videoHeight)*.05)
          this.$panResType=2;
          console.log('gesState vy',gestureState.vy)
          let upordown =gestureState.dy-this.state.dyLast;
          let value;
          if(upordown>0){
              value = this.state.volume-(gestureState.moveY/this.state.videoHeight)*.05
          }else if(upordown<0){
              value = this.state.volume+(gestureState.moveY/this.state.videoHeight)*.05
          }
          console.log('value',value)
          this.setState({
            dyLast:gestureState.dy,
          })
            console.log('gesState value',value)
          if (value < 0){
              value = 0;
          }
          if (value >1){
              value = 1;
          }
          if(upordown!=0){
            SystemSetting.setVolume(value);
            this.setState({
                volume: value,
                isShowVolume:true,     //显示音量滑动
            })
          }
      } else {
          this.setState({isShowVolume:false,})
      }

    }

    jindu = (gestureState) => {
      //进度
      if(Math.abs(gestureState.dx)>15 && Math.abs(gestureState.dy)<10 || this.$panResType == 3){
          this.$panResType=3
          let current = this.$currentTime+gestureState.dx*.5;
          if (gestureState.dx > 0){
              this.setState({ShowDurationIco:true})
          } else {
              this.setState({ShowDurationIco:false})
          }
          if(current < 0){
              current = 0;
          }
          if(current > this.$duration){
              current = this.$duration;
          }
          this._currentTime = current;
          this._isSet = true;
          this.setState({
              currentTime:current,
              isShowDuration:true,
          });
      }else{
          this._isSet = false;
          this.setState({isShowDuration:false})
      }
    }


    onPanResponderMove = (evt, gestureState) => {

        switch(this.$panResType){
          case 0:
              this.liangdu(gestureState);
              this.yinliang(gestureState);
              this.jindu(gestureState);
              break;
          case 1:
              this.liangdu(gestureState);
              break;
          case 2:
              this.yinliang(gestureState);
              break;
          case 3:
              this.jindu(gestureState);
              break;

        }






    }

    onPanResponderRelease = (evt, gestureState) => {
        this.setState({
            isShowVolume:false,
            isShowBrightness:false,
            isShowDuration:false,
        });
        if(this._isSet){
            this._isSet = false;
            this._onSliderValueChange(this._currentTime);
        }
        if(!this.state.isShowDuration || !this.state.isShowVolume || !this.state.isShowBrightness && !this.state.isPaused){
            if(this.state.isShowControl){
                this._onTapVideo();
            }else{
                this.timer&&clearTimeout(this.timer);
                this.setState({
                    isShowControl: true,
                });
                this.timer = setTimeout(()=>{
                    this.setState({
                        isShowControl: false,
                    });
                },5000)
            }
        }
    }

    render() {
        return (
            <View
                style={[{width: this.state.videoWidth, height: this.state.videoHeight,backgroundColor:'#000'}, this.props.style]}>
                {/*<View style={{backgroundColor:'rgba(0,0,0,0.6)',width:'100%',height:20,position:'absolute',top:6,zIndex:100}} />*/}
                {/*<Image source={require('../../res/images/common/video_blur.png')} resizeMode={'cover'} blurRadius={100} style={{width:'100%',height:30,position:'absolute',zIndex:100}} />*/}
                <Video
                    ref={(ref) => { this.videoRef = ref }}
                    source={{uri: this.state.videoUrl}}
                    resizeMode="contain"
                    rate={this.state.playRate}
                    volume={this.state.volume}
                    muted={this.state.isMuted}
                    ignoreSilentSwitch={"ignore"}
                    style={{position:'absolute', left: this.state.x, top: 0, width: this.state.videoWidth-2*this.state.x, height: this.state.videoHeight}}
                    paused={this.state.isPaused}
                    onLoadStart={this._onLoadStart}
                    onBuffer={this._onBuffering}
                    onLoad={this._onLoad}
                    onProgress={this._onProgressChange}
                    onEnd={this._onPlayEnd}
                    onError={this._onPlayError}
                    playInBackground={false}
                    playWhenInactive={false}
                />
                {
                    this.state.hasCover && this.state.isShowVideoCover ?
                        <Image
                            style={{position: 'absolute', top: 0, left: 0, width: this.state.videoWidth, height: this.state.videoHeight}}
                            source={{uri: this.state.videoCover}}
                            resizeMode={'contain'}
                        /> : null
                }

                <View
                    {...this._panResponder.panHandlers}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: this.state.videoWidth,
                        height: this.state.videoHeight,
                        backgroundColor: this.state.isPaused ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
                        alignItems:'center',
                        justifyContent:'center'
                    }}>
                    {/*亮度*/}
                    {
                        this.state.isShowBrightness ?
                            <View style={{
                                backgroundColor:'rgba(0, 0, 0, 0.2)',
                                width:180,
                                height:30,
                                flexDirection:'row',
                                borderRadius:4
                            }}>
                                <Image
                                    source={require('./image/icon_brightness.png')}
                                    style={{ marginRight: 5, width: 18, height: 18,margin: 6}}
                                />
                                <Slider
                                    style={{flex: 1,lineHeight:30}}
                                    maximumTrackTintColor={'rgba(0,0,0,0.6)'}//滑块右侧轨道的颜色
                                    minimumTrackTintColor={'#7D3ED3'}//滑块左侧轨道的颜色
                                    thumbImage={require('./image/icon_control_slider.png')}
                                    value={this.state.brightness}
                                    minimumValue={0}
                                    maximumValue={1}
                                />
                            </View> : null
                    }
                    {/*音量*/}
                    {
                        this.state.isShowVolume ?
                            <View style={{
                                backgroundColor:'rgba(0, 0, 0, 0.2)',
                                width:180,
                                height:30,
                                flexDirection:'row',
                                borderRadius:4
                            }}>
                                <Image
                                    source={require('./image/icon_volume_up.png')}
                                    style={{ marginRight: 5, width: 18, height: 18,margin: 6}}
                                />
                                <Slider
                                    style={{flex: 1,lineHeight:30}}
                                    maximumTrackTintColor={'rgba(0,0,0,0.6)'}//滑块右侧轨道的颜色
                                    minimumTrackTintColor={'#7D3ED3'}//滑块左侧轨道的颜色
                                    thumbImage={require('./image/icon_control_slider.png')}
                                    value={this.state.volume}
                                    minimumValue={0}
                                    maximumValue={1}
                                />
                            </View> : null
                    }
                    {/*快进*/}
                    {
                        this.state.isShowDuration ?
                            <View style={[{
                                backgroundColor:'rgba(0, 0, 0, 0.2)',
                                width:180,
                                height:30,
                                flexDirection:'row',
                                borderRadius:4,}
                            ]}>
                                <Image
                                    source={this.state.ShowDurationIco ? require('./image/video_player_next.png') : require('./image/video_player_back.png')}
                                    style={{ marginRight: 5, width: 21, height: 12,margin: 9}}
                                />
                                <Text style={{color:'#fff',lineHeight:30}}>{formatTime(this.state.currentTime)}</Text>
                            </View> : null
                    }
                    {
                        this.state.isLoading ?
                            <View style={{alignItems:'center', justifyContent: 'center',}}>
                                <ActivityIndicator
                                    animating={true}
                                    color='#FFF'
                                    size="large"
                                />
                            </View>
                            : null
                    }
                </View>

                {
                    (this.state.isPaused && !this.state.isLoading && !this.state.isShowVideoCover)  ?
                        <TouchableWithoutFeedback  style={{zIndex: 100,flex:1}}>
                            {
                                this.props.isShiKan === 0 ?
                                    <View style={{justifyContent:'center',alignItems:'center',flex:1}}>
                                    <TouchableWithoutFeedback onPress={()=>Linking.openURL(this.state.ad1.url)}>
                                    <FastImage source={{uri:this.props.videoCover}} resizeMode={'cover'} style={{position:'absolute',width: '80%', height: '80%', justifyContent: 'center', alignItems: 'center', margin: 'auto'}} />
                                    </TouchableWithoutFeedback>
                                    <TouchableWithoutFeedback onPress={this._onTapPlayButton}>
                                    <Image
                                        style={styles.playButton}
                                        source={require('./image/icon_video_play.png')}
                                    />
                                    </TouchableWithoutFeedback>
                                    </View>
                                    :
                                    <View style={{justifyContent:'center',alignItems:'center',flex:1}}>
                                        <Text style={{fontWeight: 'bold',color:'#fff'}}>非会员只能试看一分钟，购买会员可无限制观看</Text>
                                        <Text
                                            onPress={this.props.onClickBuyVip}
                                            style={{color:'#fff',fontSize:12,lineHeight:12,paddingVertical: 4,paddingHorizontal: 8,borderRadius:10,backgroundColor:'#E73636',marginTop: 10,zIndex:1000}}
                                        >升级VIP</Text>
                                    </View>
                            }
                        </TouchableWithoutFeedback>
                        :

                            this.props.isShiKan === 1 ?
                                <TouchableOpacity onPress={this.props.onClickBuyVip} style={{backgroundColor:'rgba(0,0,0,0.6)',paddingHorizontal:10,paddingVertical:5,borderRadius:10,flexDirection:'row',alignItems:'center',position: 'absolute',right:20,top:35}}>
                                    <Text style={{fontSize:10,lineHeight:10,color:'#fff'}}>试看</Text><Text style={{fontSize:10,lineHeight:10,color:'red'}}>1分钟</Text><Text  style={{fontSize:10,lineHeight:10,color:'#fff'}}>开通VIP!</Text>
                                </TouchableOpacity>
                            :
                            null


                }
                { this.state.showIndexAdTime > 0 ?
                    <Text
                        style={{
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            lineHeight: 30,
                            borderRadius: 15,
                            overflow:'hidden',
                            color: '#fff',
                            paddingHorizontal: 15,
                            margin: 10,
                            textAlign: 'right',
                            position: 'absolute',
                            right: 10,
                            marginTop: 20
                        }}
                        onPress={() => this.setState({IndexAdShow: false})}
                    >
                        {'倒计时' + this.state.showIndexAdTime}
                    </Text>
                    :
                    null
                }
                {
                    this.state.isShowControl ?
                        <View style={[styles.bottomControl, {width: this.state.videoWidth}]}>
                            <Image
                                source={require('./image/img_bottom_shadow.png')}
                                style={{position:'absolute', top: 0, left: 0, width: this.state.videoWidth, height:50}}
                            />
                            <TouchableOpacity activeOpacity={0.3} onPress={this._onTapPlayButton}>
                                <Image
                                    style={styles.control_play_btn}
                                    source={this.state.isPaused ? require('./image/icon_control_play.png') : require('./image/icon_control_pause.png')}
                                />
                            </TouchableOpacity>
                            <Text style={styles.timeText}>{formatTime(this.state.currentTime)}</Text>
                            <Slider
                                style={{flex: 1}}
                                maximumTrackTintColor={'rgba(0,0,0,0.6)'}//滑块右侧轨道的颜色
                                minimumTrackTintColor={'#7D3ED3'}//滑块左侧轨道的颜色
                                thumbImage={require('./image/icon_control_slider.png')}
                                value={this.state.currentTime}
                                minimumValue={0}
                                maximumValue={Number(this.state.duration)}
                                onValueChange={this._onSliderValueChange}
                            />
                            <Text style={styles.timeText}>{formatTime(this.state.duration)}</Text>
                            {
                                this.props.enableSwitchScreen ?
                                    <TouchableOpacity activeOpacity={0.3} onPress={this._onTapSwitchButton}>
                                        <Image
                                            style={styles.control_switch_btn}
                                            source={this.state.isFullScreen ? require('./image/icon_control_shrink_screen.png') : require('./image/icon_control_full_screen.png')}
                                        />
                                    </TouchableOpacity> : null
                            }
                        </View> : null
                }
                {
                    this.state.isFullScreen && this.state.isShowControl ?
                        <View
                            style={{
                                position:'absolute',
                                top: 0,
                                left: 0,
                                width: this.state.videoWidth,
                                height: 50,
                                flexDirection:'row',
                                alignItems:'center'
                            }}>
                            <Image
                                source={require('./image/img_top_shadow.png')}
                                style={{position:'absolute', top: 0, left: 0, width: this.state.videoWidth, height:50}}
                            />
                            <TouchableOpacity style={styles.backButton} onPress={this._onTapBackButton}>
                                <Image
                                    source={require('./image/icon_back.png')}
                                    style={{width: 26, height: 26}}
                                />
                            </TouchableOpacity>
                            <Text style={styles.videoTitle} numberOfLines={1}>{this.state.videoTitle}</Text>
                        </View> : null
                }
                {
                    this.state.isFullScreen ? null :
                        <TouchableOpacity
                            style={{
                                position:'absolute',
                                top: 10,
                                left: 10,
                                width: 44,
                                height: 44,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onPress={this._onTapBackButton}
                        >
                            <Image
                                source={require('./image/icon_back.png')}
                                style={{width: 26, height: 26}}
                            />
                        </TouchableOpacity>
                }

            </View>
        )
    }

    /// -------播放器回调事件方法-------

    _onLoadStart = () => {
        console.log('videourl');
        console.log('视频开始加载........');
    };

    _onBuffering = () => {
        console.log('视频缓冲中...');
    };

    _onLoad = (data) => {
        console.log('视频加载完成');
        this.setState({
            duration: data.duration,
            // isPaused:false,
            // isShowVideoCover:false,
            isLoading:false,
        });
        this.videoRef.seek(this.state.videoCurrentTime);
    };

    //进度
    _onProgressChange = (data) => {
        if (!this.state.isPaused) {
            this.setState({
                currentTime: data.currentTime,
            });
            //是否开启试看
            if (data.currentTime > 60 && this.props.isShiKan === 1){
                this.setState({isPaused:true})
            }
        }
    };

    //视频播放结束触发的方法
    _onPlayEnd = () => {
        console.log('播放结束');
        this.setState({
            currentTime: 0,
            isPaused: true,
            playFromBeginning: true,
            isShowVideoCover: this.state.hasCover
        });
    };

    _onPlayError = () => {
        console.log('视频播放失败');
    };

    /// -------控件点击事件-------

    _onTapVideo = () => {
        if ( this.state.isShowControl && this.state.isPaused && !this.state.isShowDuration && !this.state.isShowVolume && !this.state.isShowBrightness){
            this.setState({
                isPaused: false,
                isShowVideoCover:false,
            })
        }
        if (this.state.isShowControl && !this.state.isPaused && !this.state.isShowDuration && !this.state.isShowVolume && !this.state.isShowBrightness){
            this.setState({
                isPaused: true,
            })
        }

    };

    _onTapPlayButton = () => {
        let isPause = !this.state.isPaused;
        let isShowControl = false;
        if (!isPause) {
            isShowControl = true;
        }
        this.setState({
            isPaused: isPause,
            isShowControl: isShowControl,
            isShowVideoCover: false
        });
        if (this.state.playFromBeginning) {
            this.videoRef.seek(this.state.currentTime);
            this.setState({
                playFromBeginning: false,
            })
        }
    };

    _onSliderValueChange = (currentTime) => {
        this.videoRef.seek(currentTime);
        if (this.state.isPaused) {
            this.setState({
                isPaused: false,
                isShowVideoCover: false
            })
        }
    };

    // 点击展开全屏或收起全屏
    _onTapSwitchButton = () => {
        this.props.onChangeOrientation && this.props.onChangeOrientation(this.state.isFullScreen);
    };

    // 点击返回键
    _onTapBackButton = () => {
        if (this.state.isFullScreen) {
            Orientation.lockToPortrait();
        } else {
            this.props.onTapBackButton && this.props.onTapBackButton();
        }
    };

    /// --------外部调用方法--------

    updateVideo(videoUrl, seekTime, videoTitle) {
        let title = (videoTitle != null) ? videoTitle : this.state.videoTitle;
        this.setState({
            videoUrl: videoUrl,
            videoTitle: title,
            isPaused: false,
            isShowVideoCover: false,
        });
        this.videoRef.seek(seekTime);
    }

    updateLayout(width, height, isFullScreen) {
        let xPadding = 0;
        if (isFullScreen) {
            // 全屏模式下iPhone X左右两边需要留出状态栏的部分，避免视频被刘海遮住
            xPadding = isIPhoneX ? statusBarHeight : 0;
        }
        this.setState({
            x: xPadding,
            videoWidth: width,
            videoHeight: height,
            isFullScreen: isFullScreen
        })
    }

}

export function formatTime(second) {
    let h = 0, i = 0, s = parseInt(second);
    if (s > 60) {
        i = parseInt(s / 60);
        s = parseInt(s % 60);
    }
    // 补零
    let zero = function (v) {
        return (v >> 0) < 10 ? "0" + v : v;
    };
    return [zero(i), zero(s)].join(":");
}
export const screenWidth = Dimensions.get('window').width;
export const screenHeight = Dimensions.get('window').height;
export const defaultVideoHeight = screenWidth * 9/16;
export const isIPhoneX = DeviceInfo.isIPhoneX_deprecated;
export const statusBarHeight = isIPhoneX ? 44 : 20;
export const isSystemIOS = (Platform.OS === 'ios');

const styles = StyleSheet.create({
    playButton: {
        width: 50,
        height: 50,
    },
    bottomControl: {
        flexDirection: 'row',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0
    },
    timeText: {
        fontSize: 13,
        color: 'white',
        marginLeft: 10,
        marginRight: 10
    },
    videoTitle: {
        fontSize: 14,
        color: 'white',
        flex: 1,
        marginRight: 10,
    },
    control_play_btn: {
        width: 34,
        height: 34,
        marginLeft: 15
    },
    control_switch_btn: {
        width: 15,
        height: 15,
        marginRight: 15
    },
    backButton: {
        flexDirection:'row',
        width: 44,
        height: 44,
        alignItems:'center',
        justifyContent:'center',
        marginLeft: 10
    },
    bottomOptionView: {
        flexDirection: 'row',
        alignItems:'center',
        marginRight: 15,
        height: 50
    },
    bottomOptionText: {
        fontSize: 14,
        color: 'white',
    },
    topOptionView: {
        flexDirection: 'row',
        alignItems:'center',
        marginRight: 15,
        height: 50
    },
    topOptionItem: {
        width: 50,
        height: 50,
        alignItems:'center',
        justifyContent:'center'
    },
    topImageOption: {
        width: 24,
        height: 24
    }
});

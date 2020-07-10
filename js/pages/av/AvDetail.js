

import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    SafeAreaView,
    Dimensions,
    Text,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Share,
    TextInput,
    Alert, FlatList, StatusBar, Modal, Image, Clipboard, DeviceEventEmitter, Linking
} from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome5";
import TagDetail from "../../pages/class/TagDetail";
import NvyouItemSon from "../../common/NvyouItemSon";
import Dialog, {DialogContent, DialogTitle, DialogButton, DialogFooter} from 'react-native-popup-dialog';
import AvItemSon from "../../common/AvItemSon";
import VideoPlayer from '../../video/VideoPlayer';
import Theme, {createThemedComponent} from 'react-native-theming';
import ViewShot from "react-native-view-shot";
import FastImage from 'react-native-fast-image';
import moment from 'moment';
import QRCode from 'react-native-qrcode';
import {FetchRequest} from "../../util/FetchRequest";
import {DownloadVideo} from "../../video/DownloadVideo";
import Orientation from 'react-native-orientation';

const deviceInfo = {
    deviceWidth: Dimensions.get('window').width,
    deviceHeight: Dimensions.get('window').height,
};

let pageNo = 0;//当前第几页
let itemNum = 8;    //一页显示数量

const MdSafeAreaView = createThemedComponent(SafeAreaView);
const MdTouchableOpacity = createThemedComponent(TouchableOpacity);
const MdIcon = createThemedComponent(Icon,['color']);

export default class AvDetail extends Component{

    /*static navigationOptions = ({ navigation }) => {
        const { state } = navigation;
        const tabBarVisible = state.params ? state.params.fullscreen : true;
        return {
            // For the tab navigators, you can hide the tab bar like so
            tabBarVisible,
        }
    }*/

    constructor(props){
        super(props);
        this.state={
            AllDate:[],     //全部数据
            MovieDetail:[],
            MovieUrl:[],        //视频URL
            actor:[],
            MoreList:[],
            label:[],
            showTags:false, //是否显示标签
            isZan:'',        //是否点赞
            zan_lv:'100%',    //点击百分比
            isLike:0,         //是否收藏
            isLoading: true,
            showNetwork: false,
            //网络请求状态
            error: false,
            errorInfo: "",
            showFoot:0, // 控制foot， 0：隐藏footer  1：已加载完成,没有更多数据   2 ：显示加载中
            isRefreshing:false,//下拉控制
            endPage:false, //是否到达最后一页
            isRefresh:false,//下拉刷新
            //播放器
            ad:[],
            ad1:[],
            fullScreen:false,
            showHidden:false,   //隐藏状态栏
            showShareModal:false,   //显示分享弹窗
            showDownloadModal:false,//显示下载弹窗
        };

        //隐藏底部导航栏
        this.props.navigation.setParams({
            fullscreen: false,
        })
    }


    componentWillMount() {
        this.getDetail();
        Orientation.lockToPortrait();
    }

    componentDidMount(){

    }

    componentWillUnmount(){
        pageNo = 0;
        Orientation.lockToPortrait();
    }


    //获取详情
    getDetail() {
        FetchRequest(
            global.ActiveDomain+"/movie_detail",
            'POST',
            {
                m_id:this.props.navigation.getParam('tabId'),
                account:global.UniqueId
            },
            (result)=>{
                if (result.code === 200){
                    if(result.data.movie_url.length === 0){
                        this.props.navigation.goBack();
                        Alert.alert(
                            '温馨提示',
                            '该视频暂无播放地址请观看其他视频',
                            [
                                {text: '确定', onPress: () => this.props.navigation.goBack()},
                            ],
                            { cancelable: false }
                        )
                    }else{
                        console.log('adva',result.data.ad1);
                        this.setState({
                            AllDate:result.data,          //全部数据
                            MovieDetail:result.data.movie,
                            MovieUrl:result.data.movie_url,         //视频播放连接列表
                            PlayerUrl:result.data.movie_url[0].url,  //默认第一条连接给播放器
                            actor:result.data.actor,
                            label:result.data.label,
                            ad:result.data.ad,
                            ad1:result.data.ad1,
                            isZan:result.data.zan,        //是否点赞
                            zan_lv:result.data.zan_lv+'%',    //点击百分比
                            isLike:result.data.like,          //是否收藏
                            doBug:false,                            //问题反馈
                            doBugTxt:'',                            //问题反馈内容
                            isLoading:false,
                        });
                        this.getMoreData(pageNo);
                    }
                }else{
                    Alert.alert(
                        '温馨提示',
                        result.msg,
                        [
                            {text: '返回', onPress: () => this.props.navigation.goBack()},
                            {text: '去推广', onPress: () => {this.props.navigation.goBack();this.props.navigation.navigate('SharePage')}},
                            {text: '购买会员', onPress: () => {this.props.navigation.goBack();this.props.navigation.navigate('VipShowPage')}},
                        ],
                        { cancelable: false }
                    )
                }
            },
            (error)=>{
                // DeviceEventEmitter.emit('showToast',error)
                Alert.alert(
                        '温馨提示',
                        '数据获取异常，请检查网络，code'+error,
                        [
                            {text: '返回'},
                        ],
                        { cancelable: false }
                    )
            }
        )
    };

    //加载等待页
    _renderLoadingView() {
        return (
            <Theme.View style={[styles.container,{alignItems:'center', justifyContent: 'center',backgroundColor:'@BackgroundColor',flex:1}]}>
                <ActivityIndicator
                    animating={true}
                    color='#7D3ED3'
                    size="large"
                />
            </Theme.View>
        );
    }

    //点击 标签展示
    _showTags(){
        this.setState({
            showTags:!this.state.showTags,
        });
    }

    //点击 分享
    _sharePage(){
        return  FetchRequest(
                    global.ActiveDomain+"/Sharing",
                    "ENCRYPTO",
                    {
                        invite_code: global.InviteCode,
                    },
                    (responseJson) => {
                        if (responseJson.code === 200){
                            Clipboard.setString(responseJson.data[0].url);
                            DeviceEventEmitter.emit('showToast','复制成功');
                        }else{
                            DeviceEventEmitter.emit('showToast','获取失败');
                        }
                    },
                    (error) => {
                            DeviceEventEmitter.emit('showToast','获取失败');
                    }
                )

    }

    //点赞
    _doZan(id){
        FetchRequest(global.ActiveDomain+"/Movie_praise",
            "ENCRYPTO",
            {
                m_id: this.state.AllDate.movie.id,
                account: global.UniqueId,
                type:id,
            },
            (responseJson) => {
                if (responseJson.code === 200){
                    this.setState({
                        isZan:id
                    })
                }
            },
            (error) => {
                console.error(error);
                Alert.alert(
                    '温馨提示',
                    '数据获取异常，请检查网络，code'+error,
                    [
                        {text: '返回'},
                    ],
                    { cancelable: false }
                )
            }

        )
    }

    //收藏
    _collection(id){
        FetchRequest(global.ActiveDomain+"/Favorite_movie",
            "ENCRYPTO",
            {
                m_id: this.state.MovieDetail.id,
                account: global.UniqueId,
            },
            (responseJson) => {
                if (responseJson.code === 200){
                    this.setState({
                        isLike:id
                    })
                }
            },
            (error) => {
                // console.error(error);
                Alert.alert(
                    '温馨提示',
                    '数据获取异常，请检查网络，code'+error,
                    [
                        {text: '返回'},
                    ],
                    { cancelable: false }
                )
            }
        )

    }

    //下载视频
    _doDownload(url){
        url = url.split('?')[0];
        if (!url.endsWith('m3u8')) {
            DeviceEventEmitter.emit('showToast','当前格式不支持缓存，请联系管理员');
            return false;
        }
        FetchRequest(
            global.ActiveDomain+"/Caching_add",
            'ENCRYPTO',
            {
                account:global.UniqueId,
                m_id:this.state.MovieDetail.id,
            },
            (result)=>{
                if (result.code === 200){
                    DownloadVideo(this.state.MovieDetail.id,url,this.state.MovieDetail.title,this.state.MovieDetail.img);
                }else{
                    this.setState({showDownloadModal:true});
                    DeviceEventEmitter.emit('showToast',result.msg)
                }
            },
            (error)=>{
                this.setState({showDownloadModal:true});
                DeviceEventEmitter.emit('showToast',error)
            }
        )
    }

    //问题反馈 快捷输入文字
    _doBugTxt(item){
        if (this.state.doBugTxt !== '') {
            this.setState({
                doBugTxt:this.state.doBugTxt+','+item,
            })
        }else{
            this.setState({
                doBugTxt:item,
            })
        }
    }

    //问题反馈 提交
    _doPostBugTxt(){
        FetchRequest(
            global.ActiveDomain+"/feedback",
            'POST',
            {
                content: this.state.doBugTxt,
                account: global.UniqueId,
                m_id:this.state.MovieDetail.id,
            },
            (result)=>{
                if (result.code === 200){
                    this.setState({ doBug: false });
                    DeviceEventEmitter.emit('showToast',result.msg)
                } else {
                    DeviceEventEmitter.emit('showToast',result.msg)
                }
            },
            (error)=>{
                DeviceEventEmitter.emit('showToast',error)
            }
        )
    }

    getMoreData( pageNo ) {
        FetchRequest(
            global.ActiveDomain+"/Movie_relateds",
            "ENCRYPTO",
            {
                account: global.UniqueId,
                page: pageNo,
                num: itemNum,
                m_id: this.state.MovieDetail.id
            },
            (responseJson) => {
              if(responseJson!=""){
                let data = responseJson.data.list;
                let dataBlob = [];
                if (pageNo === 0){
                    dataBlob = data;
                } else {
                    dataBlob = this.state.listDate.concat(data);
                }

                let foot = 0;
                let endpage = false;
                if(data.length < itemNum){
                    foot = 1;//listView底部显示没有更多数据了
                    endpage = true; //已经最后一页了
                }
                this.setState({
                    //复制数据源
                    listDate:dataBlob,
                    isLoading: false,
                    showFoot:foot,
                    isRefreshing:false,
                    endPage:endpage,
                });
                data = null;
                dataBlob = null;
              }else{
                this.setState({
                  isLoading: false,
                  showFoot: 0,
                  isRefreshing:false,
                  });
              }
            },
            (error) => {
                Alert.alert(
                    '温馨提示',
                    '数据获取异常，请检查网络，code'+error,
                    [
                        {text: '返回'},
                    ],
                    { cancelable: false }
                )
                console.log(error);
                this.setState({
                    error: true,
                    errorInfo: error
                })
            }


        )
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
                    // alert('请重试点击广告')
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
                // alert('请重试点击广告')
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

    //切换线路
    _switch(url){
        this.setState({
            PlayerUrl:url,
            showNetwork:false,
        })
        DeviceEventEmitter.emit('showToast','切换线路成功，正在缓冲！')

    }

    //下拉刷新
    _onRefresh=()=>{
        // 不处于 下拉刷新
        if(!this.state.isRefresh){
            pageNo = 0;
            this.getMoreData(pageNo);
        }
    };

    //加载失败view
    _renderErrorView() {
        return (
            <View style={[styles.container,{backgroundColor:'@BackgroundColor',flex:1}]}>
                <Text>
                    加载失败
                </Text>
            </View>
        );
    }

    //上拉加载更多
    _onEndReached(){
        //如果是正在加载中或没有更多数据了，则返回
        if(this.state.showFoot !== 0 ){
            return ;
        }
        //如果当前页大于或等于总页数，那就是到最后一页了，返回
        if((pageNo!==0) && (this.state.endPage)){
            return;
        } else {
            pageNo++;
        }
        //底部显示正在加载更多数据
        this.setState({showFoot:2});
        //获取数据
        this.getMoreData( pageNo );
    }


    _renderFooter(){
        if (this.state.showFoot === 1) {
            return null;
            // return (
            //     <View style={{height:30,alignItems:'center',justifyContent:'flex-start',}}>
            //         <Text style={{color:'#999999',fontSize:14,marginTop:5,marginBottom:5,}}>
            //             我也有底线的，撸不动了……
            //         </Text>
            //     </View>
            // );
        } else if(this.state.showFoot === 2) {
            return (
                <View style={{alignItems:'center',justifyContent:'flex-start',}}>
                    <ActivityIndicator
                        animating={true}
                        color='#7D3ED3'
                    />
                    <Text style={{color:'#999999',fontSize:14,marginTop:5,marginBottom:5,}}>正在加载更多数据...</Text>
                </View>
            );
        } else if(this.state.showFoot === 0){
            return null;
        }
    }


    //相关视频 头部
    _ListHeaderComponent(){
        let width = deviceInfo.deviceWidth;
        return(
            <Theme.View style={{flex:1,backgroundColor:'@BackgroundColor'}}>
                <View style={{flexDirection:'row',paddingHorizontal:10,marginTop:10}}>
                        {this.state.MovieDetail.vip === 1 ?
                            <Theme.Text style={{height:width /24,marginRight:5,backgroundColor:'#7D3ED3',color:'@WriteTextColor',paddingHorizontal:10,borderRadius:5,lineHeight:15,paddingVertical: 0,overflow:'hidden',fontSize:10}}>VIP</Theme.Text>
                            :
                            <Theme.Text style={{height:width /24,marginRight:5,backgroundColor:'#f4bd3f',color:'@WriteTextColor',paddingHorizontal:10,borderRadius:5,lineHeight:15,paddingVertical: 0,overflow:'hidden',fontSize:10}}>限免</Theme.Text>
                        }
                    <Theme.Text style={{color:'@BlackTextColor',flex:1,fontWeight: 'bold',padding:0,borderRadius:5}} numberOfLines={2}>
                            {this.state.MovieDetail.title}
                    </Theme.Text>
            </View>

            <View style={{flexDirection:'row',paddingHorizontal:10,marginTop:14}}>
                    <Theme.Text style={{color:'@LabelTextColor',flex:1}}>更新于：{moment(this.state.MovieDetail.c_time*1000).format("YYYY-MM-DD")}</Theme.Text>
                    {
                        this.state.isZan === 1 ?
                            <MdIcon name={'thumbs-up'} color={'@WriteTextColor'} style={{borderWidth: 1, borderColor: '@ThemeColor', backgroundColor:'@ThemeColor', padding: 5, borderRadius: 4,overflow:'hidden'}}/>
                            :
                            <MdIcon onPress={() => this._doZan(1)} name={'thumbs-up'} color={'@ThemeColor'} style={{borderWidth: 1, borderColor: '@ThemeColor', padding: 5, borderRadius: 4,overflow:'hidden'}}/>
                    }
                    <Theme.View style={{padding:2,borderColor:'@LineColor',borderWidth:1,width:width*0.3,borderRadius:5,overflow:'hidden',marginHorizontal:10}}>
                        <Theme.Text style={{color:'@TextColor',position:'absolute',width:width*0.3,fontSize:10,zIndex:1,lineHeight:24,paddingHorizontal:5}}>{this.state.zan_lv}的人觉得很赞</Theme.Text>
                        <Theme.View style={{backgroundColor:'#ffd596',width:this.state.zan_lv,flex:1,borderRadius:5,overflow:'hidden'}} />
                    </Theme.View>
                    {
                        this.state.isZan === 2 ?
                            <MdIcon name={'thumbs-down'} color={'@WriteTextColor'} style={{
                                borderWidth: 1,
                                borderColor: '@LabelTextColor',
                                padding: 5,
                                borderRadius: 4,
                                backgroundColor:'@LabelTextColor',
                                overflow:'hidden'
                            }}/>
                            :
                            <MdIcon onPress={() => this._doZan(2)} name={'thumbs-down'} color={'@LabelTextColor'} style={{
                                borderWidth: 1,
                                borderColor: '@LabelTextColor',
                                padding: 5,
                                borderRadius: 4,
                                overflow:'hidden'
                            }}/>
                    }
            </View>
                <View style={{flexDirection:'row',paddingHorizontal:10,marginTop:10}}>
                    <MdTouchableOpacity onPress={()=>this.setState({showNetwork:!this.state.showNetwork})} style={{flex:1,flexDirection:'row',alignItems:'center'}}>
                        <MdIcon name={'bars'} color={'@ThemeColor'} />
                        <Theme.Text style={{color:'@TextColor',paddingHorizontal:10}}>线路切换</Theme.Text>
                        <MdIcon name={this.state.showNetwork ? 'angle-up' : 'angle-down'} color={'@TextColor'} />
                    </MdTouchableOpacity>
                    <MdTouchableOpacity style={{paddingHorizontal:8,alignItems:'center'}}  onPress={()=>this._showTags()}>
                        <MdIcon name={'tag'} color={'@ThemeColor'} size={18} />
                        <Theme.Text style={{color:'@TextColor',fontSize:12}}>标签</Theme.Text>
                    </MdTouchableOpacity>
                    <MdTouchableOpacity onPress={()=>this._sharePage()} style={{paddingHorizontal:8,alignItems:'center'}}>
                        <MdIcon name={'share-alt-square'} color={'@ThemeColor'} size={18} />
                        <Theme.Text style={{color:'@TextColor',fontSize:12}}>分享</Theme.Text>
                    </MdTouchableOpacity>
                    <MdTouchableOpacity onPress={()=>this._doDownload(this.state.PlayerUrl)} style={{paddingHorizontal:8,alignItems:'center'}}>
                        <MdIcon name={'cloud-download-alt'} color={'@ThemeColor'} size={18} />
                        <Theme.Text style={{color:'@TextColor',fontSize:12}}>下载</Theme.Text>
                    </MdTouchableOpacity>
                    {
                        this.state.isLike === 1 ?
                            <Theme.Text onPress={()=>this._collection(0)} style={{color:'@WriteTextColor',borderWidth:1,borderColor:'@ThemeColor',backgroundColor:'@ThemeColor',padding:5,borderRadius:5,overflow:'hidden',marginTop:5,marginLeft:10}}>已收藏</Theme.Text>
                            :
                            <Theme.Text onPress={()=>this._collection(1)} style={{color:'@LabelTextColor',borderWidth:1,borderColor:'@LabelTextColor',padding:5,borderRadius:5,marginTop:5,marginLeft:10}}>收藏影片</Theme.Text>
                    }
                </View>

                {
                    this.state.showTags ?
                        <View style={{flexDirection:'row',paddingHorizontal:10,marginTop:10}}>
                            {
                                this.state.label.map((value,key)=>{
                                    return(
                                        <Theme.Text
                                            style={{color:'@ThemeColor',borderColor:'@ThemeColor',borderWidth:1,paddingHorizontal:15,lineHeight:24,borderRadius:12,textAlign: 'center',fontSize:12,marginRight:10}}
                                            onPress={()=>this.props.navigation.navigate('TagDetail',{labelId:value.id,stateId:1,navBarTitle:value.name})}
                                            key={value.id+'-'+key}
                                        >{value.name}</Theme.Text>
                                    )
                                })
                            }
                        </View>
                        :
                        null
                }

                {
                    this.state.showNetwork ?
                        <View style={{paddingHorizontal:10,flexDirection:'row',flexWrap:'wrap'}}>
                            {
                                this.state.AllDate.vip !== 0 ?

                                    this.state.MovieUrl.map((value, index) =>
                                        this.state.PlayerUrl === value.url ?
                                            <Theme.Text
                                                onPress={()=>this._switch(value.url)}
                                                key={index}
                                                style={{color:'@TextColor',borderColor:'@7D3ED3',borderWidth:1,paddingHorizontal:15,lineHeight:24,borderRadius:12,textAlign: 'center',fontSize:10,marginTop:10,marginRight:10}}
                                            >{value.name}</Theme.Text>
                                        :
                                            <Theme.Text
                                                onPress={()=>this._switch(value.url)}
                                                key={index}
                                                style={{color:'@TextColor',borderColor:'@BackgroundColor3',borderWidth:1,paddingHorizontal:15,lineHeight:24,borderRadius:12,textAlign: 'center',fontSize:10,marginTop:10,marginRight:10}}
                                            >{value.name}</Theme.Text>
                                    )
                                    :
                                    this.state.MovieUrl.map((value, index) =>
                                        value.type === 1 ?
                                            this.state.PlayerUrl === value.url ?
                                                <Theme.Text
                                                    onPress={()=>this._switch(value.url)}
                                                    key={index}
                                                    style={{color:'@TextColor',borderColor:'@7D3ED3',borderWidth:1,paddingHorizontal:15,lineHeight:24,borderRadius:12,textAlign: 'center',fontSize:10,marginTop:10,marginRight:10}}
                                                >{value.name}</Theme.Text>
                                            :
                                                <Theme.Text
                                                    onPress={()=>this._switch(value.url)}
                                                    key={index}
                                                    style={{color:'@TextColor',borderColor:'@BackgroundColor3',borderWidth:1,paddingHorizontal:15,lineHeight:24,borderRadius:12,textAlign: 'center',fontSize:10,marginTop:10,marginRight:10}}
                                                >{value.name}</Theme.Text>
                                        :
                                        null
                                    )
                            }
                        </View>
                        :
                        null
                }

                <View style={{height:5,backgroundColor:'#eee',marginTop:10}} />
                <View style={styles.nvyou}>
                    <Theme.Text style={{marginTop:10,marginLeft:5,fontSize:14,color:'@TextColor'}}>赞助商</Theme.Text>
                        <TouchableOpacity activeOpacity={1} onPress={()=>this._clickAd(this.state.ad1[0])}>
                          <FastImage source={{uri:this.state.ad1[0].img}} resizeMode={'cover'} style={{width:width-20,height:(width-20)/5.03125,borderRadius:5,marginTop:10,marginLeft:10}} />
                        </TouchableOpacity>
                </View>
                <View style={{height:5,backgroundColor:'#eee',marginTop:10}} />
                <View style={styles.nvyou}>
                    <Theme.Text style={{marginTop:10,marginLeft:5,fontSize:14,color:'@TextColor'}}>演出女优</Theme.Text>
                    <View style={styles.nvyou_list}>
                        <ScrollView
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                        >
                            {
                                this.state.actor.map((item) => {
                                    return(
                                        <NvyouItemSon item={item} key={item.id} is_like={item.is_like} {...this.props}/>
                                    )
                                })
                            }
                        </ScrollView>
                    </View>
                </View>

                <View style={{height:5,backgroundColor:'#eee'}} />
                <Theme.Text style={{marginTop:10,marginLeft:5,fontSize:14,color:'@TextColor'}}>相关影片</Theme.Text>
            </Theme.View>
        )
    }

    _onLayoutChange = (event) => {
        let {x, y, width, height} = event.nativeEvent.layout;
        let isLandscape = (width > height);
        if (isLandscape) {
            this.setState({
                isFullScreen: true,
                videoHeight: height,
                showHidden:false,
            });
            this.videoPlayer.updateLayout(width, height, true);
            /*this.props.navigation.setParams({
                fullscreen: false
            })*/
        } else {
            this.setState({
                isFullScreen: false,
                videoHeight: width * 9/16,
                showHidden:false,
            });
            this.videoPlayer.updateLayout(width, width * 9/16, false);
            /*this.props.navigation.setParams({
                fullscreen: true,
            })*/
        }
        // Orientation.unlockAllOrientations();
    };

    _onOrientationChanged = (isFullScreen) => {
        if (isFullScreen) {
            Orientation.lockToPortrait();
        } else {
            Orientation.lockToLandscapeLeft();
        }
    };

    render(){
        //第一次加载等待的view
        if (this.state.isLoading) {
            return this._renderLoadingView();
        }
        console.log('ad',this.state.ad[0].img);
        const placeholder = this.state.ad[0].img;
        return(
            <MdSafeAreaView style={{flex:1,backgroundColor:'#000'}} forceInset={{ bottom: 'never' }}>
                <StatusBar
                    hidden={this.state.showHidden}
                    barStyle={'dark-content'}
                />
                <View style={styles.container} onLayout={this._onLayoutChange}>
                    {
                        this.state.PlayerUrl !== '' ?
                            <VideoPlayer
                                ref={(ref) => this.videoPlayer = ref}
                                videoID={this.state.MovieDetail.id}
                                videoURL={this.state.PlayerUrl}
                                videoCurrentTime={this.props.navigation.getParam('playTime')}
                                videoTitle={this.state.MovieDetail.title}
                                videoCover={placeholder.startsWith('http') ? placeholder : global.ActiveDomain+placeholder}
                                ad1={this.state.ad1[0]}
                                onChangeOrientation={this._onOrientationChanged}
                                onTapBackButton={()=>this.props.navigation.goBack()}
                                onClickBuyVip={()=>this.props.navigation.navigate('VipShowPage')}
                                isShiKan={this.state.AllDate.shikan}
                                isVip={this.state.MovieDetail.vip}
                            />
                            :
                            null
                    }

                    <Theme.View style={{flex:1,backgroundColor:'@BackgroundColor'}}>
                        <FlatList
                            data={this.state.listDate}
                            keyExtractor={(item,index) => item.id.toString()+'-'+index}
                            renderItem={(item)=><AvItemSon item={item.item} is_like={item.item.like} {...this.props}/>}
                            numColumns = {2}
                            initialNumToRender={1}
                            horizontal={false}
                            style={{width:'100%'}}
                            ListHeaderComponent={this._ListHeaderComponent()}
                            //上拉加载
                            ListFooterComponent={this._renderFooter.bind(this)}
                            onEndReached={this._onEndReached.bind(this)}
                            onEndReachedThreshold={0.2}
                            //下拉刷新相关
                            onRefresh={() => this._onRefresh()}
                            refreshing={this.state.isRefresh}

                        />
                    </Theme.View>
                </View>
            </MdSafeAreaView>
        )
    }
}


const styles = StyleSheet.create({
    container:{
        flex:1,
        zIndex:9999999,
    },
    video:{
        height:220,
        backgroundColor:'#000',
        flex:1,
        zIndex: 999
    },
    video_style:{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },

    top:{

    },
    top_top:{
        flexDirection: 'row',
        height:40,
        marginTop: 5,
    },
    top_tag:{
        flex:2,
        borderLeftWidth: 1,
        borderLeftColor:'#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    top_tag_ico:{
        fontSize:24,
        color: '#999'
    },
    top_tag_txt:{
        fontSize: 12,
        color: '#999'
    },
    tags:{
        flexDirection:'row',
        flexWrap:'wrap',
    },
    tags_item:{
        paddingVertical:2,
        paddingHorizontal:10,
        fontSize:12,
        lineHeight:16,
        borderRadius:8,
        borderWidth: 1,
        marginTop:5,
        marginLeft:5
    },
    like:{
        height: 30,
        flexDirection: 'row',
        margin: 5,
        marginTop: 8,
    },
    like_ico:{
        lineHeight: 30,
        borderRadius:5,
        borderWidth: 1,
        flex:1,
        width:30,
        height:30,
        fontSize:20,
        textAlign: 'center',
        overflow: 'hidden'
    },
    collect:{
        flexDirection:'row',
        justifyContent: 'flex-end',
        marginTop:8,
        marginBottom: 15,
    },
    collect_button:{
        borderRadius:5,
        borderWidth: 1,
        borderColor:'#999',
        padding: 5,
        paddingRight: 8,
        paddingLeft: 8,
        color:'#999',
        marginRight: 5,
    },
    collect_button_active:{
        borderRadius:5,
        borderWidth: 1,
        padding: 5,
        paddingRight: 8,
        paddingLeft: 8,
        color:'#FFF',
        marginRight: 5,
    },

    nvyou:{

    },
    nvyou_list:{
        flexDirection:'row',
    },
    nvyou_item:{
        width:deviceInfo.deviceWidth/4,
        justifyContent:'center',
        alignItems:'center',
        marginTop:8,
        padding:10,
    },
    nvyou_item_img:{
        width: 80,
        height:80,
        borderRadius: 40,
    },
    nvyou_item_soucang:{
        width:'100%',
        padding:4,
        borderRadius:13,
        color: '#7D3ED3',
        borderWidth: 1,
        borderColor: '#7D3ED3',
        margin:5,
        alignItems:'center',
        justifyContent:'center',
        textAlign:'center'
    },
    nvyou_item_soucangin:{
        width:'100%',
        padding:4,
        borderRadius:13,
        color: '#fff',
        backgroundColor: '#7D3ED3',
        margin:5,
        overflow:'hidden',
        alignItems:'center',
        justifyContent:'center',
        textAlign:'center'
    },

    moreMove:{
        flex:1,
        backgroundColor:'red'
    },

    //播放器
    movieContainer: {
        justifyContent: 'space-between',
        zIndex:998
    },
    videoPlayer: {
        width:deviceInfo.deviceWidth,
        height:220,
    },
    toolBarStyle: {
        position:'relative',
        marginBottom:0,
        bottom:0,
        backgroundColor: '#000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        height: 30,
        width:'100%',
        opacity:0.6
    },
    timeStyle: {
        width: 35,
        color: '#FFF',
        fontSize: 12
    },
    slider: {
        flex: 1,
        marginHorizontal: 5,
        height: 20,
        width:200,
    },
    progressStyle: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginHorizontal: 10
    },
    indicator: {
        height: 220,
        width: deviceInfo.deviceWidth,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navToolBar: {
        backgroundColor: 'transparent',
        marginHorizontal: 5
    }
});

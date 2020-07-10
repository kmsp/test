/**
 * 我的界面
 */
import React, {Component} from 'react';
import {
    Image,
    StyleSheet,
    Text,
    View,
    ScrollView,
    Alert,
    TouchableOpacity,
    SafeAreaView,
    Linking,
    Switch,
    TextInput, ActivityIndicator, Dimensions, DeviceEventEmitter
} from 'react-native';
import DeviceStorage from '../util/DeviceStorage';
import Dialog, {DialogButton, DialogContent, DialogTitle, DialogFooter} from "react-native-popup-dialog";
import DeviceInfo from "react-native-device-info";
import Toast, {DURATION} from 'react-native-easy-toast';
import clear from 'react-native-clear-app-cache';
import moment from 'moment';
import Theme, {createThemedComponent} from 'react-native-theming';
import Icon from "react-native-vector-icons/FontAwesome";
import {FetchRequest} from "../util/FetchRequest";
import Color from "../common/Color";
import Orientation from 'react-native-orientation';
import NoNetworkContainer from '../common/NoNetwork';

const MdSafeAreaView = createThemedComponent(SafeAreaView);
const MdScrollView = createThemedComponent(ScrollView);
const MdIcon = createThemedComponent(Icon,['color']);
const Button = createThemedComponent(TouchableOpacity);

const { width, height } = Dimensions.get('window');


export default class MyPage extends Component{

    constructor(props){
        super(props);
        this.state={
            isLock:false,  //是否开启了密码锁
            isDark: global.Theme,   //夜间模式
            doShareCodeTxt:'',  //输入邀请码内容
            doShareCode:false,  //输入邀请码 弹窗
            UserInfo:[],        //观看次数 数据
            VipInfo:[],         //VIP信息

            //网络请求状态
            isLoading: true,

            error: false,
            errorInfo: "",

            cacheSize:"",
            unit:"",

        };
        clear.getAppCacheSize((value,unit)=>{
            this.setState({
                cacheSize:value, //缓存大小
                unit:unit  //缓存单位
            })
        });
    }

    componentWillMount(){
        Orientation.lockToPortrait();
        //如果开启了密码
        DeviceStorage.get('LockPass').then((result) => {
            if (result !== null) {
                this.setState({
                    isLock:true
                })
            }
        });
    }


    componentDidMount(){
        this.props.navigation.addListener('didFocus', () => {this.getUserInfo();this._getVipInfo();})
    }

    componentWillUnmount(){
        this.props.navigation.removeListener('didFocus', () => {this.getUserInfo();this._getVipInfo();})
        Orientation.lockToPortrait();
    }

    getUserInfo(){
        FetchRequest(
            global.ActiveDomain+"/look",
            'POST',
            {
                account:global.UniqueId,
            },
            (result)=>{
                if (result.code === 200){
                    this.setState({
                        UserInfo:result.data,
                        isLoading:false,
                    });
                } else {

                }
            },
            (error)=>{
              this.setState({
                  isLoading:false,
                  error:true,
              });
                // alert('数据获取异常，请检查网络，code'+error);
            }
        );
    }

    //获取VIP信息
    _getVipInfo(){
        let UniqueId = '406369C1-4AF1-4636-8892-62681C3A8FBF';
        FetchRequest(
            global.ActiveDomain+"/register",
            'POST',
            {
                phone_code: UniqueId,
            },
            (result)=>{
                if (result.code === 200){
                    this.setState({VipInfo:result.data});
                    global.UserVip = result.data.vip;
                    global.isShiKan = result.data.shikan;
                } else {
                    this.refs.toast.show(result.msg);
                }
            },
            (error)=>{
              this.setState({
                  isLoading:false,
                  error:true,
              });
                // this.refs.toast.show('数据获取异常，请检查网络，code'+error);

              }

        );
    }


    //输入邀请码提交
    _doPostShareCode(){
        FetchRequest(
            global.ActiveDomain+"/share_code",
            'POST',
            {
                code: this.state.doShareCodeTxt,
                account: global.UniqueId,
            },
            (result)=>{
                if (result.code === 200){
                    this.setState({ doShareCode: false });
                    this.refs.toast.show('邀请成功');
                }else{
                    this.setState({ doShareCode: false });
                    this.refs.toast.show(result.msg);
                }
            },
            (error)=>{
                this.setState({ doShareCode: false });
                this.refs.toast.show('数据获取异常，请检查网络，code'+error);
            }
        );

    }


    //密码锁状态
    _isLock(){
        this.setState({
            isLock:!this.state.isLock
        })
    }

    //夜间模式
    _isDark(){
        DeviceStorage.delete('Theme');
        if(this.state.isDark === false) {
            Color[1].apply();
            DeviceEventEmitter.emit('theme_change', Color[1].def );
            DeviceStorage.save('Theme','darkTheme');
        } else {
            Color[0].apply();
            DeviceEventEmitter.emit('theme_change', Color[0].def );
            DeviceStorage.save('Theme','lightTheme');
        }
        this.setState({isDark: !this.state.isDark});
    }


    //官方potato群
    _clickTggroup(){
        Linking.openURL(this.state.VipInfo.qun).catch(err => console.error('An error occurred', err))
    }

    //加载等待页
    _renderLoadingView() {
        return (
          <Theme.View style={{alignItems:'center', justifyContent: 'center',backgroundColor:'@BackgroundColor',flex:1}}>
              <ActivityIndicator
                  animating={true}
                  color='#7D3ED3'
                  size="large"
              />
          </Theme.View>
        );
    }

    //加载失败view
    _renderErrorView() {
        return (
          <Theme.View style={{alignItems:'center', justifyContent: 'center',backgroundColor:'@BackgroundColor',flex:1}}>
            <NoNetworkContainer navigate={this.props.navigation.navigate}/>
          </Theme.View>
        );
    }

    //清理缓存
    clearCache(){

        //Todo 提示更新
        Alert.alert(
            '',
            '是否清理缓存？',
            [
                {text: '取消', onPress: () => console.log('Ask me later pressed')},
                {text: '确定', onPress: () => {
                        clear.clearAppCache(()=>{
                            clear.getAppCacheSize((value,unit)=>{
                                this.setState({
                                    cacheSize:value, //缓存大小
                                    unit:unit  //缓存单位
                                })
                            });
                        });
                    }},
            ],
            { cancelable: true }
        );

    }

    render(){
        //第一次加载等待的view
        if (this.state.isLoading && !this.state.error) {
            return this._renderLoadingView();
        } else if (this.state.error) {
            //请求失败view
            return this._renderErrorView();
        }

        return(
            <MdSafeAreaView style={[{flex:1,backgroundColor:'@BackgroundColor'}]} forceInset={{ bottom: 'never' }}>
                <MdScrollView style={{backgroundColor:'@BackgroundColor'} }>

                    <Theme.View style={[styles.top,{backgroundColor:'@TabTextColor'}]}>
                        <Image source={require('../../res/images/common/me_photo.png')} style={{height:60,resizeMode: 'contain'}} />
                        <Text style={{color:'#fff',marginTop: 8}}>
                            {
                                this.state.VipInfo.vip !== 0
                                    ?
                                    'VIP到期时间:'+ moment(this.state.VipInfo.vip_time*1000).format("YYYY-MM-DD HH:mm:ss")
                                    : '每日可观看次数：'+(this.state.UserInfo.have_num < 0 ? 0 : this.state.UserInfo.have_num)+'/'+this.state.UserInfo.all_num
                            }</Text>
                        <Text style={{color:'#fff',marginTop: 8,fontSize:12}}>本周可下载次数: {this.state.VipInfo.down}</Text>

                    </Theme.View>

                    <View style={{flexDirection:'row',justifyContent:'space-around',paddingVertical: 10}}>
                        <TouchableOpacity style={styles.top_item} onPress={()=>this.props.navigation.navigate('VipShowPage')}>
                            <View>
                                <Image source={require('../../res/images/common/me_buy.png')} style={{width:30,height:30}} />
                            </View>
                            <Theme.Text style={[styles.top_item_title,{color:'@MyPageTextColor'}]}>购买会员</Theme.Text>
                            <Theme.Text style={[styles.top_item_des,{color:'@MyPageTextColor2'}]}>超清播放</Theme.Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.top_item]} onPress={()=>this.props.navigation.navigate('ProxyPage',{Agent_link:this.state.VipInfo.agent_link})}>
                            <View>
                                <Image source={require('../../res/images/common/me_daili.png')} style={{width:30,height:30}} />
                            </View>
                            <Theme.Text style={[styles.top_item_title,{color:'@MyPageTextColor'}]}>代理招募</Theme.Text>
                            <Theme.Text style={[styles.top_item_des,{color:'@MyPageTextColor2'}]}>返利高达49%</Theme.Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.top_item]} onPress={()=>this.props.navigation.navigate('TixianPage',{Money:this.state.UserInfo.balance})}>
                            <View>
                                <Image source={require('../../res/images/common/me_money.png')} style={{width:30,height:30}} />
                            </View>
                            <Theme.Text style={[styles.top_item_title,{color:'@MyPageTextColor'}]}>余额提现</Theme.Text>
                            <Theme.Text style={[styles.top_item_des,{color:'@MyPageTextColor2'}]}>¥{this.state.UserInfo.balance}.00</Theme.Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.top_item]} onPress={()=>this.props.navigation.navigate('SharePage')}>
                            <View>
                                <Image source={require('../../res/images/common/me_share.png')} style={{width:30,height:30}} />
                            </View>
                            <Theme.Text style={[styles.top_item_title,{color:'@MyPageTextColor'}]}>分享推广</Theme.Text>
                            <Theme.Text style={[styles.top_item_des,{color:'@MyPageTextColor2'}]}>已推{this.state.UserInfo.share_num}人</Theme.Text>
                        </TouchableOpacity>
                    </View>

                    <Theme.View style={{height:5,backgroundColor:'@JiangeColor'}} />
                    <View>
                        <Theme.View style={{height:3,backgroundColor:'@JiangeColor'}} />
                        <View style={styles.item}>
                            <MdIcon name={'expeditedssl'} size={20} color={'@TabTextColor'} style={styles.item_icon} />
                            <Theme.Text style={[styles.item_text,{color:'@TextColor'}]}>密码锁</Theme.Text>
                            <View style={styles.item_right}>
                                <Switch
                                    style={{lineHeight:40,marginRight:10}}
                                    onValueChange={() => this.props.navigation.navigate('Lock',{refresh:() => {
                                            this._isLock();
                                        }})}
                                    value={this.state.isLock} />
                            </View>
                        </View>
                    </View>

                        <Theme.View style={{height:5,backgroundColor:'@JiangeColor'}} />
                        <View style={{flexDirection:'row',justifyContent:'space-around',paddingVertical: 10}}>
                            <TouchableOpacity style={styles.top_item} onPress={()=>this.props.navigation.navigate('CollectionPage')}>
                                <View>
                                    <Image source={require('../../res/images/common/me_collection.png')} style={{width:30,height:30}} />
                                </View>
                                <Theme.Text style={[styles.top_item_title,{color:'@MyPageTextColor'}]}>我的收藏</Theme.Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.top_item]} onPress={()=>this.props.navigation.navigate('PlayHistory')}>
                                <View>
                                    <Image source={require('../../res/images/common/me_history.png')} style={{width:30,height:30}} />
                                </View>
                                <Theme.Text style={[styles.top_item_title,{color:'@MyPageTextColor'}]}>播放历史</Theme.Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.top_item]} onPress={()=>Linking.openURL(this.state.VipInfo.qun)}>
                                <View>
                                    <Image source={require('../../res/images/common/me_kaiche.png')} style={{width:30,height:30}} />
                                </View>
                                <Theme.Text style={[styles.top_item_title,{color:'@MyPageTextColor'}]}>开车群</Theme.Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.top_item]} onPress={()=>this.props.navigation.navigate('Kefu')}>
                                <View>
                                    <Image source={require('../../res/images/common/me_kefu.png')} style={{width:30,height:30}} />
                                </View>
                                <Theme.Text style={[styles.top_item_title,{color:'@MyPageTextColor'}]}>在线客服</Theme.Text>
                            </TouchableOpacity>
                        </View>
                        <Theme.View style={{height:5,backgroundColor:'@JiangeColor'}} />
                        <View style={{flexDirection:'row',justifyContent:'space-around',paddingVertical: 10}}>
                            <TouchableOpacity style={styles.top_item} onPress={()=>this.props.navigation.navigate('DownloadPage')}>
                                <View>
                                    <Image source={require('../../res/images/common/me_down.png')} style={{width:30,height:30}} />
                                </View>
                                <Theme.Text style={[styles.top_item_title,{color:'@MyPageTextColor'}]}>下载管理</Theme.Text>
                            </TouchableOpacity>
                            {
                                this.state.VipInfo.phone ?
                                    <TouchableOpacity style={[styles.top_item]} onPress={()=>this.props.navigation.navigate('BingPhonePage',{Type:2})}>
                                        <View>
                                            <Image source={require('../../res/images/common/me_phone.png')} style={{width:30,height:30}} />
                                        </View>
                                        <Theme.Text style={[styles.top_item_title,{color:'@MyPageTextColor'}]}>解绑手机</Theme.Text>
                                    </TouchableOpacity>
                                    :
                                    <TouchableOpacity style={[styles.top_item]} onPress={()=>this.props.navigation.navigate('BingPhonePage',{Type:1})}>
                                        <View>
                                            <Image source={require('../../res/images/common/me_phone.png')} style={{width:30,height:30}} />
                                        </View>
                                        <Theme.Text style={[styles.top_item_title,{color:'@MyPageTextColor'}]}>绑定手机</Theme.Text>
                                    </TouchableOpacity>
                            }
                            <TouchableOpacity style={[styles.top_item]} onPress={()=>this.clearCache()}  activeOpacity={1}>
                                <View>
                                    <Image source={require('../../res/images/common/me_clear.png')} style={{width:30,height:30}} />
                                </View>
                                <Theme.Text style={[styles.top_item_title,{color:'@MyPageTextColor'}]}>清理缓存</Theme.Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.top_item]} onPress={()=>this.props.navigation.navigate('VipCode')}>
                                <View>
                                    <Image source={require('../../res/images/common/me_duihuan.png')} style={{width:30,height:30}} />
                                </View>
                                <Theme.Text style={[styles.top_item_title,{color:'@MyPageTextColor'}]}>兑换VIP</Theme.Text>
                            </TouchableOpacity>
                        </View>
                        <Theme.View style={{height:5,backgroundColor:'@JiangeColor'}} />
                        <View style={{flexDirection:'row',justifyContent:'space-around',paddingVertical: 10}}>
                            <TouchableOpacity style={[styles.top_item]} onPress={()=>this.props.navigation.navigate('Acount')}>
                                <View>
                                    <Image source={require('../../res/images/common/me_account.png')} style={{width:30,height:30}} />
                                </View>
                                <Theme.Text style={[styles.top_item_title,{color:'@MyPageTextColor'}]}>账号信息</Theme.Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.top_item]} onPress={()=>this.props.navigation.navigate('ScanCode')}>
                                <View>
                                    <Image source={require('../../res/images/common/me_saoma.png')} style={{width:30,height:30}} />
                                </View>
                                <Theme.Text style={[styles.top_item_title,{color:'@MyPageTextColor'}]}>扫码登陆</Theme.Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.top_item]} onPress={()=>this.props.navigation.navigate('FindAccountPage')}>
                                <View>
                                    <Image source={require('../../res/images/common/me_zhaohui.png')} style={{width:30,height:30}} />
                                </View>
                                <Theme.Text style={[styles.top_item_title,{color:'@MyPageTextColor'}]}>找回账号</Theme.Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.top_item} onPress={()=>this.props.navigation.navigate('SafeCodePage')}>
                                <View>
                                    <Image source={require('../../res/images/common/me_key.png')} style={{width:30,height:30}} />
                                </View>
                                <Theme.Text style={[styles.top_item_title,{color:'@MyPageTextColor'}]}>安全码</Theme.Text>
                            </TouchableOpacity>
                        </View>
                        <Theme.View style={{height:5,backgroundColor:'@JiangeColor'}} />

                </MdScrollView>
                <Toast
                    style={{opacity:0.6}}
                    textStyle={{color:'#FFF'}}
                    position={'top'}
                    ref="toast"
                />
            </MdSafeAreaView>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    top:{
        paddingTop: 20,
        paddingBottom: 20,
        alignItems:'center',
        borderBottomLeftRadius:70,
        borderBottomRightRadius: 70
    },
    topbotton:{
        lineHeight:20,
        fontSize:12,
        color:'#7D3ED3',
        backgroundColor: '#fff',
        paddingLeft:8,
        paddingRight:8,
        marginRight: 10,
        borderRadius:5,
        overflow: 'hidden',
    },

    item:{
        flexDirection: 'row',
        height: 40,
        borderBottomColor:'#ccc',
        borderBottomWidth: 1,
        paddingHorizontal: 10
    },
    item_icon:{
        lineHeight:40,
        width:20,
        textAlign: 'center'
    },
    item_text: {
        fontSize:14,
        lineHeight: 40,
        marginLeft: 5,
    },
    item_right:{
        flex:1,
        flexDirection:'row',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    item_right_right:{
        fontSize:24,
        lineHeight:40,
        fontWeight: '500',
        marginRight:10,
        marginLeft: 10,
        color:'#ccc'
    },
    item_right_text:{

    },

    top_item:{
        alignItems:'center',
        width:(width-3)/4
    },
    top_item_border:{
        borderLeftColor:'#efefef',
        borderLeftWidth: 1
    },
    top_item_image:{
        width:36,height:36
    },
    top_item_title:{
        fontSize:14,lineHeight:20
    },
    top_item_des:{
        fontSize:10,lineHeight:18
    }
});

import React, {Component} from 'react';
import {
    ImageBackground,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Linking,
    Alert,
    Modal,
    Dimensions,
    NativeModules,
    Platform,
} from 'react-native';
import AppNavigator from '../common/AppNavigator';
import DeviceInfo from 'react-native-device-info';
import DeviceStorage from '../util/DeviceStorage';
import Theme, {createTheme, createThemedComponent} from 'react-native-theming';
import Color from "../common/Color";
import Toast, {DURATION} from 'react-native-easy-toast';
import FastImage from 'react-native-fast-image';
import OpeninstallModule from 'openinstall-react-native'
import {FetchRequest} from "../util/FetchRequest";
import MD5 from "react-native-md5";
import Orientation from 'react-native-orientation';
import NetInfo from "@react-native-community/netinfo";


const {height,width} = Dimensions.get('window');

//目前iPhone X序列手机的适配算法：高宽比先转换为字符串，截取前三位，转换为number类型 再乘以100
export const isIphoneX = (Platform.OS === 'ios' && (Number(((height/width)+"").substr(0,4)) * 100) === 216);
const Button = createThemedComponent(TouchableOpacity);
export default class WelCome extends Component{
    constructor(props){
        super(props);
        this.state={
            theme:{},   //当前主题
            checkMsg:'检查可用线路',
            opacity:1,
            ActiveDomain:'',
            DomainList:'',
            IndexAd:[],
            IndexAdShow:false,
            showIndexAdTime:5,
            IndexGongGao:'',
            IndexGongGaoShow:false,
            shareCode:'',               //邀请码

            //密码锁
            showModal:false,
            inputPwd:"",
            msg:"请输入密码",
            LockPass:'',    //是否有密码锁、密码锁密码
            newLockPass:'',    //新密码
            reLockPass:'',  //二次密码
        };

    }

    componentWillMount(){
        Orientation.lockToPortrait();
        //检查设备锁

        DeviceStorage.get('LockPass').then((result) => {
            if (result !== null) {
                this.setState({
                    LockPass:result,
                    showModal:true,
                })
            }else{
                //进入APP

                this.checkUrl();
            }

        });

        //本地缓存视频库
        DeviceStorage.get('localMovie').then((result) => {
            if (result !== '' && result !== null) {
                global.localMovie = result;
            }else{
            }
        });

        let param = {
            pageName: "main"
        };
        DeviceStorage.get('Theme').then((result) => {
            if (result === 'darkTheme') {
                Color[1].apply();
                this.setState({theme:Color[1].def});
                global.Theme = true;
            }else{
                this.setState({theme:Color[0].def});
                global.Theme = false;
            }
        })
    }

    componentDidMount(){

    }

    componentWillUnmount(){
        Orientation.lockToPortrait();
        global.key = 'eb@evl6XKEKtTxX%';
        clearInterval(this.IndexAdTime);
        //跳出页面，清空临时数据
        this.setState({
            newLockPass:'',    //新密码
            reLockPass:'',  //二次密码
        });

        let param = {
            pageName: "main"
        };

        if(this.appListener){
            this.appListener.remove();
        }
        if (this.toastListener) {
            this.toastListener.remove();
        }
    }

    //修改主题
    onThemeChange(theme){
        if(!theme) return;
        this.setState({
            theme:theme
        })
    }

    //密码锁-输入密码
    pressNum(num){
        let pwd = this.state.inputPwd;
        this.setState({
            inputPwd:pwd+""+num,
        });
        this.renderPwd();
        setTimeout(()=>{
            let inputPwd = this.state.inputPwd;
            if(pwd.length === 5){
                //如果设置了密码
                //如果有密码、验证密码
                if (this.state.LockPass){
                    if(this.state.LockPass === inputPwd){
                        //ToDo密码成功，删除密码
                        this.setState({
                            LockPass:'',
                            showModal:false,
                            msg:'解锁成功',
                        });
                        //进入APP
                        this.checkUrl();

                    } else {
                        this.setState({
                            msg:'密码错误，请重新输入',
                        });
                        setTimeout(()=>{
                            this.setState({
                                inputPwd:"",
                                msg:'请输入密码',
                            });
                        },1000);
                    }
                }
            }
        },10);
    }

    //密码锁-回退密码
    deleteNum(){
        let pwd = this.state.inputPwd;
        pwd = pwd.substring(0,pwd.length-1);
        this.setState({
            inputPwd:pwd,
        });
        this.renderPwd();
    }

    //密码锁-刷新密码状态
    renderPwd(){
        var vi = [];
        var inputPwd = this.state.inputPwd;
        for(var i=0; i<6; i++){
            if(i <= inputPwd.length-1){
                vi.push(<View key={i} style={styles.blackPoint}/>);
            } else {
                vi.push(<View key={i} style={styles.whitePoint} />);
            }
        }
        return vi;
    }

    //检查当前域名是否可用
    checkUrl(){
      NetInfo.getConnectionInfo().then((connectionInfo) => {
        console.log('Initial, type: ' + connectionInfo.type + ', effectiveType: ' + connectionInfo.effectiveType);
        if(connectionInfo.type =="none"){
          this.goToApp()
        }

      });
        DeviceStorage.get('ActiveDomain').then((result) => {
            if (result !== null) {
                // alert(result);
                fetch(result+"/test", {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({

                    })
                })
                    .then(response => response.json())
                    .then(responseJson => {
                        if (responseJson.code !== 200){
                            alert(responseJson.code);
                            //Todo当前域名不可用
                            this.getActiveDomain();
                        }else{
                            //写入全局变量
                            global.ActiveDomain = result;
                            //临时写入域名
                            this.setState({
                                ActiveDomain:result
                            });
                            this.checkUpdate();
                        }
                    })
                    .catch(error => {
                        //Todo当前域名不可用
                        this.getActiveDomain();
                        console.error(error);
                    });
            }else{
                //获取可用域名
                // alert('重新获取');
                this.getActiveDomain();
            }
        });
    }


    //从现域名库中获取可用域名
    getActiveDomain(){
        DeviceStorage.get('DomainList').then((result) => {
            if (result == '' || result == null){
                DeviceStorage.delete('DomainList');
                this.getAllDomain();
            } else {
                let TempDomainList = result;
                TempDomainList.forEach((value,key)=>{
                    fetch(value.url+"/test", {
                        method: "POST",
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({

                        })
                    })
                        .then(response => response.json())
                        .then(responseJson => {
                            if (responseJson.code !== 200){
                                // alert('检查状态非200');
                                //Todo 从域名库中删除当前域名
                                TempDomainList.pop();
                                DeviceStorage.save('DomainList',TempDomainList);
                            }else{
                                // alert('拉到域名了');
                                //Todo 将当前域名写入存储，跳转进行检测版本
                                DeviceStorage.save('ActiveDomain',value.url);
                                this.checkUrl();
                                return false;
                            }
                        })
                        .catch(error => {
                            //Todo 从域名库中删除当前域名
                            TempDomainList.pop();
                            DeviceStorage.save('DomainList',TempDomainList);
                            console.error(error);
                        });
                })
            }
        });
    }

    //弹出公告
    getGonggao(){
      FetchRequest(
          global.ActiveDomain+"/Announcement",
          'ENCRYPTO',
          {
              account: global.UniqueId,
          },
          (result)=>{
              if (result.data.length > 0){
                  this.setState({IndexGongGao:result.data,IndexGongGaoShow:true});
              }else{
                  this.indexAd();
              }
          },
          (error)=>{
              this.indexAd();
              console.error(error);
          }
      )
    }

    //获取新的域名库
    getAllDomain(){
        FetchRequest(
            'https://lc.qzquest.com/domain',
            'POST',
            {},
            (result)=>{
                if (result.code === 200){
                    //将新获取的域名全部存入
                    DeviceStorage.save('DomainList',result.data);
                    //重新判断域名是否可用
                    this.getActiveDomain();
                }else{
                    Alert.alert(
                        '更新线路',
                        result.msg,
                        [
                            {text: '重试'},
                        ],
                        { cancelable: true }
                    )
                }
            },
            (error)=>{
                Alert.alert(
                    '更新线路',
                    '网络连接失败，请检查网络连接！',
                    [
                        {text: '重试'},
                    ],
                    { cancelable: true }
                )
            }
        )
    }

    //检查版本更新
    checkUpdate(){
        this.setState({
            checkMsg:'检查最新版本'
        });
        //Todo 版本更新检测
        let NowVersion = DeviceInfo.getVersion();  //当前版本号
        let type = 0;
        if (Platform.OS === 'android'){
            type = 1;
        } else {
            type = 2;
        }
        FetchRequest(
            global.ActiveDomain+"/version",
            'POST',
            {
                type:type,
                account: global.UniqueId,

            },
            (result)=>{
                if (result.data.version !== NowVersion){
                    //Todo 提示更新
                    Alert.alert(
                        '更新新版本',
                        result.data.content,
                        [
                            {text: '取消', onPress: () => {
                                    this.regedit();
                                }},
                            {text: '立即更新', onPress: () => this._downUpload(result.data)},
                        ],
                        { cancelable: true }
                    )
                } else {
                    //检测用户
                    this.regedit();
                }
            },
            (error)=>{
                this.regedit();
            }
        )
    }

    //下载更新软件
    _downUpload(data){
        if(Platform.OS==='android'){
            Linking.openURL(data.address);
            //检测用户
            this.regedit();
        }else{
            Linking.openURL(data.address);
            //检测用户
            this.regedit();
        }

    }

    //注册账户
    regedit(){
        let UniqueId = "406369C1-4AF1-4636-8892-62681C3A8FBF";
        FetchRequest(
            global.ActiveDomain+"/register",
            'POST',
            {
                phone_code: UniqueId,
            },
            (result)=>{
                if (result.code === 200){
                    DeviceStorage.save('UniqueId',result.data.phone_code);
                    DeviceStorage.save('UserId',result.data.account);
                    DeviceStorage.save('InviteCode',result.data.invite_code);
                    global.InviteCode = result.data.invite_code;
                    global.TixianCode = result.data.pass;
                    global.UserVip = result.data.vip;
                    global.isShiKan = result.data.shikan;
                    global.kfurl = result.data.kefu_url;
                    //判断是否是邀请注册
                    OpeninstallModule.getInstall(10, map => {
                        if(map){
                            let mapDate = map.data;
                            if (mapDate) {
                                //do your work here
                                if(Platform.OS==='android'){
                                    let shareDate = JSON.parse(mapDate);
                                    this.setState({shareCode:shareDate.share});
                                }else {
                                    this.setState({shareCode:mapDate.share});
                                }
                                this._doPostShareCode();
                            }
                        }
                    });

                    //加载首页广告
                    this.getGonggao();

                    //Todo 进入App
                    // this.goToApp();
                }else{
                    //注册用户失败，重新获取域名
                    this.checkUrl();
                }
            },
            (error)=>{
                //注册用户失败，重新获取域名
                this.checkUrl();
            }
        )
    }

    //录入邀请码
    _doPostShareCode(){
        FetchRequest(
            global.ActiveDomain+"/share_code",
            'POST',
            {
                code: this.state.shareCode,
                account: DeviceInfo.getUniqueID(),
            },
            (result)=>{

            },
            (error)=>{
                this.refs.toast.show('数据获取异常，请检查网络，code'+error);
            }
        );

    }

    //加载首页广告
    indexAd(){
        FetchRequest(
            global.ActiveDomain+"/Startup",
            'POST',
            {},
            (result)=>{
                if ((result.data).length > 0) {
                    console.log(result.data[0]);
                    this.setState({IndexAd:result.data[0],IndexAdShow:true});
                    //首屏广告倒计时
                    this.IndexAdTime = setInterval(()=>{
                        if (this.state.showIndexAdTime > 0) {
                            this.setState({
                                showIndexAdTime:this.state.showIndexAdTime-1
                            })
                        }else{
                            clearInterval(this.IndexAdTime);
                            this.setState({showIndexAd:false})
                            this.setState({IndexAdShow: false})
                        }
                    },1000);
                }
                //Todo 检测公告
                this.goToApp();
            },
            (error)=>{
                //Todo 检测公告
                this.goToApp();
            }
        );
    }

    //进入APP
    goToApp(){

        //写入全局变量
        global.UniqueId = "406369C1-4AF1-4636-8892-62681C3A8FBF";
        this.setState({
            opacity:0,
            checkMsg:'加载页面',
            IndexGongGaoShow:false,
        });
        // this.zhengshu();
    }



    //点击广告
    _clickAd(item){
        FetchRequest(global.ActiveDomain+"/Advertising_records",
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
                // alert('请重试点击广告');
                Alert.alert(
                        '温馨提示',
                        '请重试点击广告',
                        [
                            {text: '返回'},
                        ],
                        { cancelable: false }
                    );
                console.error(error);
            }
        )

    }

    //官方TG群
    _contact(){
        Linking.openURL('https://chat.pinzs.net/php/app.php?widget-mobile&name=无法进入').catch(err => console.error('An error occurred', err))
    }

    render(){
        return(
            <View style={{flex:1}}>
                <Modal visible={this.state.showModal}
                       transparent={false}
                       animationType='fade'
                       onRequestClose={() => {}}
                       style={{flex:1}}
                       ref="pwdmodal"
                >
                    <View style={{flex:1,justifyContent:'center',alignItems:'center', backgroundColor:'#2A3740',paddingLeft:30,paddingRight:30}}>
                        <View style={{justifyContent:'center',alignItems:'center',marginTop:20}}>
                            <Text style={{fontSize:16,color:'#fff'}}>{this.state.msg}</Text>
                        </View>
                        <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',height:60}}>
                            {this.renderPwd()}
                        </View>
                        <View style={{width:width-60,}}>
                            <View style={styles.row}>
                                <NumComp num="1" pressNum={()=>this.pressNum(1)}/>
                                <NumComp num="2" pressNum={()=>this.pressNum(2)}/>
                                <NumComp num="3" pressNum={()=>this.pressNum(3)}/>
                            </View>
                            <View style={styles.row}>
                                <NumComp num="4" pressNum={()=>this.pressNum(4)}/>
                                <NumComp num="5" pressNum={()=>this.pressNum(5)}/>
                                <NumComp num="6" pressNum={()=>this.pressNum(6)}/>
                            </View>
                            <View style={styles.row}>
                                <NumComp num="7" pressNum={()=>this.pressNum(7)}/>
                                <NumComp num="8" pressNum={()=>this.pressNum(8)}/>
                                <NumComp num="9" pressNum={()=>this.pressNum(9)}/>
                            </View>
                            <View style={styles.row}>
                                <NumComp num="取消" textStyle={{fontSize:16}} style={{borderWidth:0}} pressNum={()=>this.deleteNum()}/>
                                <NumComp num="0" pressNum={()=>this.pressNum(0)}/>
                                <NumComp num="删除" textStyle={{fontSize:16}} style={{borderWidth:0}} pressNum={()=>this.deleteNum()}/>
                            </View>
                        </View>
                    </View>
                </Modal>

                {
                    this.state.opacity ?
                    <ImageBackground source={require('../../res/images/screen.png')} style={{flex: 1, justifyContent: 'center', opacity: this.state.opacity}}>
                        <Modal
                            animationType="none"
                            transparent={true}
                            visible={this.state.IndexGongGaoShow}
                        >

                            <View style={{backgroundColor:'rgba(0,0,0,0.6)', flex:1,justifyContent:'center',alignItems:'center'}}>
                                <ImageBackground source={require('../../res/images/splashGirls/7.jpg')}   imageStyle={{ borderRadius: 10 }} style={{borderRadius:10, resizeMode:"contain"}}>

                                <View style={{backgroundColor:'rgba(255,255,255,0.6)',borderRadius:10,width:width*2/3}}>
                                    <Text style={{fontWeight: 'bold',fontSize:18,lineHeight:24,textAlign:'center',marginVertical:20}}>茄子公告</Text>
                                    <Text style={{fontSize:14,paddingHorizontal: 20,lineHeight:20}}>{this.state.IndexGongGao}</Text>
                                    <Button style={{backgroundColor:'@ThemeColor',margin:20,height:40,borderRadius:5}} onPress={()=>this.indexAd()}>
                                        <Text style={{fontSize:18,color:'#fff',lineHeight:40,textAlign:'center'}}>确定</Text>
                                    </Button>
                                </View>
                                </ImageBackground>

                            </View>
                        </Modal>
                        <View style={styles.checkBox}>
                            <View style={{
                                width: 120,
                                height: 90,
                                backgroundColor: 'rgba(255,255,255,0.6)',
                                borderRadius: 10,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Image source={require('../../res/images/loading.gif')} style={{width: 50, height: 50, alignItems: 'center'}} />
                                <Theme.Text style={{color: '@ThemeColor'}}>{this.state.checkMsg}</Theme.Text>
                            </View>

                            <Button onPress={() => this._contact()} style={{
                                backgroundColor: '@ThemeColor',
                                width: 160,
                                height: 30,
                                borderRadius: 5,
                                marginTop: 30
                            }}>
                                <Text style={{color: '#FFF', lineHeight: 30, textAlign: 'center'}}>无法进入，联系客服</Text>
                            </Button>
                        </View>
                    </ImageBackground>
                    :
                        (this.state.IndexAdShow === false ?
                                <View style={{flex:1}}>
                                    <AppNavigator screenProps={this.state.theme} />
                                    <Toast ref="toastWithStyle"
                                           style={{backgroundColor: 'rgba(0,0,0,0.6)' }}
                                           textStyle={{
                                               fontSize: 14,
                                               color: '#fff',
                                               fontWeight:'bold'
                                           }} position={'center'}/>
                                </View>
                            :
                                <View style={{flex: 1}}>
                                    {/*<Modal*/}
                                        {/*animationType="none"*/}
                                        {/*transparent={true}*/}
                                        {/*visible={this.state.IndexAdShow}*/}
                                        {/*onRequestClose={() => this.setState({IndexAdShow: false})}*/}
                                    {/*>*/}
                                        <TouchableOpacity onPress={() => Linking.openURL(this.state.IndexAd.url)} style={{flex: 1}}>
                                            <FastImage
                                                source={{uri: ((this.state.IndexAd.img).startsWith('http') ? this.state.IndexAd.img : global.ActiveDomain + this.state.IndexAd.img)}}
                                                style={{width: width, height: height}}
                                                resizeMode={'cover'}
                                            />
                                            <Text
                                                style={{
                                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                                    lineHeight: 20,
                                                    borderRadius: 8,
                                                    overflow:'hidden',
                                                    color: '#fff',
                                                    paddingHorizontal: 0,
                                                    margin: 10,
                                                    textAlign: 'center',
                                                    position: 'absolute',
                                                    right: 10,
                                                    marginTop: isIphoneX ? 64 : 20,
                                                }}
                                                onPress={() => this.setState({IndexAdShow: false})}
                                            >
                                                {
                                                    //this.state.showIndexAdTime === 0 ? '进入' : this.state.showIndexAdTime + 's'
                                                    this.state.showIndexAdTime + 's'
                                                }
                                            </Text>
                                        </TouchableOpacity>
                                    {/*</Modal>*/}
                                    {/*<AppNavigator screenProps={this.state.theme}/>*/}
                                    {/*<Toast ref="toastWithStyle"*/}
                                           {/*style={{backgroundColor: 'rgba(0,0,0,0.6)' }}*/}
                                           {/*textStyle={{*/}
                                               {/*fontSize: 14,*/}
                                               {/*color: '#fff',*/}
                                               {/*fontWeight:'bold'*/}
                                           {/*}} position={'center'}/>*/}
                                </View>
                        )
                }
            </View>
        );
    }

}

//按键
class NumComp extends Component{
    render(){
        return(
            <View style={[styles.gridView,]}>
                <TouchableOpacity activeOpacity={0.1} onPress={this.props.pressNum}>
                    <View style={[styles.cycle,this.props.style]}>
                        <Text style={[styles.numText,this.props.textStyle]}>{this.props.num}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
}


const styles = StyleSheet.create({
   checkBox:{
      alignItems: 'center',
   } ,
    row:{
        flexDirection:'row',
        height:60,
        marginTop:10,
        marginBottom:10,
    },
    whitePoint:{
        width:10,
        height:10,
        borderRadius:5,
        borderColor:'#fff',
        borderWidth:1,
        margin:5,
    },
    blackPoint:{
        width:10,
        height:10,
        borderRadius:5,
        borderColor:'#fff',
        borderWidth:1,
        margin:5,
        backgroundColor:'white',
    },
    gridView:{
        flex:1,
        width:60,
        justifyContent:'center',
        alignItems:'center',
    },
    cycle:{
        height:60,
        width:60,
        marginLeft:5,
        marginRight:5,
        borderRadius:30,
        borderColor:'#fff',
        borderWidth:StyleSheet.hairlineWidth,
        backgroundColor:'#2A3740',
        justifyContent:'center',
        alignItems:'center',
    },
    numText:{
        color:'white',
        fontSize:20,
        fontWeight:'bold',
    },
});

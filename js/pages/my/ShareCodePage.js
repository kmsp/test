import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    ImageBackground,
    ActivityIndicator,
    Dimensions,
    Share,
    Image,
    Clipboard,
    CameraRoll
} from 'react-native';
import Icon from "react-native-vector-icons/AntDesign";
import QRCode from 'react-native-qrcode';
import Toast from "react-native-easy-toast";
import ViewShot, { captureScreen, captureRef } from "react-native-view-shot";
import Theme, {createThemedComponent} from "react-native-theming";
import {FetchRequest} from "../../util/FetchRequest";

// 取得屏幕的宽高Dimensions
const { height } = Dimensions.get('window');

const MdSafeAreaView = createThemedComponent(SafeAreaView);

export default class ShareCodePage extends Component{

    constructor(props){
        super(props);
        this.state = {
            navbar_title:'分享页面',
            invite_code:'',     //邀请码
            //网络请求状态
            isLoading: true,
            error: false,
            errorInfo: "",
        }

        //隐藏底部导航栏
        this.props.navigation.setParams({
            fullscreen: false,
        })
    }

    componentDidMount() {
        //获取邀请码
        this.getAcount();
    }

    //获取邀请码信息
    getAcount(){
        FetchRequest(
            global.ActiveDomain+"/user/share",
            'post',
            {
                account:global.UniqueId,
            },
            (result)=>{
                if (result.code === 200){
                    this.setState({
                        invite_code:result.data.invite_code,
                        isLoading:false,
                    });
                } else {

                }
            },
            (error)=>{
                // alert('数据获取异常，请检查网络，code'+error);
                Alert.alert(
                    '温馨提示',
                    '数据获取异常，请检查网络，code'+error,
                    [
                        {text: '确定'},
                    ],
                    { cancelable: false }
                );
            }
        );
    }

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

    //加载失败view
    _renderErrorView() {
        return (
            <Theme.View style={[styles.container,{backgroundColor:'@BackgroundColor',flex:1}]}>
                <Text>
                    加载失败
                </Text>
            </Theme.View>
        );


    }

    //点击 分享
    _sharePage(){
        Share.share({
            message: "(最强撸管神器，在线看片APP)，请复制链接，在浏览器中打开 "+global.ActiveDomain+"?share="+this.state.invite_code
        })
            .then(
                //Todo 分享成功
            )
            .catch((error) => alert(error));
    }

    //复制链接
    _copyLink(){
        Clipboard.setString("咪咕爱撸，随时随地想撸就撸，优质片原日日更新，请复制链接到浏览器打开，QQ或者微信等第三方软件内置浏览器无法打开网页： "+global.ActiveDomain+"?share="+this.state.invite_code);
        this.refs.toast.show('复制成功');
    }

    _savePic(){
        let that = this;
        captureScreen({
            format: "jpg",
            quality: 0.8
        }).then(
            uri => {
                let ImageUri = (uri.toLowerCase()).includes('file://')?uri:'file://'+uri;

                let promise = CameraRoll.saveToCameraRoll(ImageUri);
                promise.then(function(result) {
                    that.refs.toast.show('已保存到相册');
                    // alert('保存成功！地址如下：\n' + result);
                }).catch(function(error) {
                    // this.refs.toast.show(error);
                    console.log('error', error);
                    // alert('保存失败！\n' + error);
                });

            },
            error => console.log("Oops, snapshot failed==" + error)
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
            <MdSafeAreaView style={{flex:1,backgroundColor:'@BackgroundColor'}} forceInset={{ bottom: 'never' }}>
                <Theme.View style={[styles.navBar,{backgroundColor:'@ThemeColor'}]}>
                    <Icon onPress={()=>this.props.navigation.goBack()} name='left' style={styles.navBarIcon}/>
                    <Text style={styles.navBarText}>{this.state.navbar_title}</Text>
                </Theme.View>
                <ScrollView style={{flex:1}}>
                    <ImageBackground style={{height:240}} resizeMode='cover' source={require('../../../res/images/share/images_share_background.png')}>
                        <View style={{flex:1,height:height,alignItems: 'center',backgroundColor:'rgba(0,0,0,0.4)'}}>
                        <View style={{backgroundColor:'#fff',borderRadius:10,height: 180,width: 180,padding: 10,marginTop:10}}>
                            <QRCode
                                value={"（在线看片APP）,请复制链接，在浏览器中打开！ "+global.ActiveDomain + "?share="+this.state.invite_code}
                                size={160}
                                bgColor='#000'
                                fgColor='white'
                            />
                        </View>
                        <Text style={{color:'#fff',fontSize:20,marginTop:10}}>我的邀请码：{this.state.invite_code}</Text>
                        </View>
                    </ImageBackground>
                    <View style={{backgroundColor:'#fff',flexDirection: 'row',justifyContent: 'space-around'}}>
                        <View style={{paddingVertical: 15}}>
                            <Image source={require('../../../res/images/share/images_share_update.png')} style={{width:50,height:50}} />
                            <Text style={{marginTop:10}}>每日更新</Text>
                        </View>
                        <View style={{paddingVertical: 15}}>
                            <Image source={require('../../../res/images/share/images_share_source.png')} style={{width:50,height:50}} />
                            <Text style={{marginTop:10}}>10W+片源</Text>
                        </View>
                        <View style={{paddingVertical: 15}}>
                            <Image source={require('../../../res/images/share/images_share_free.png')} style={{width:50,height:50}} />
                            <Text style={{marginTop:10}}>永久免费</Text>
                        </View>
                    </View>
                    <View style={{backgroundColor:'#fff',paddingBottom: 15}}>
                        <Text style={{color:'#333',marginHorizontal: 30,textAlign:'center',fontSize:12}}>如果需要分享到微信、QQ等可以直接截屏，让好友长按识别图中二维码</Text>
                    </View>
                    <View style={{backgroundColor:'#f1f1f1',height:8}} />
                    <View style={{backgroundColor:'#fff',padding: 10,flexDirection:'row'}}>
                        <TouchableOpacity style={{alignItems:'center'}} onPress={()=>this._savePic()}>
                            <Image source={require('../../../res/images/share/images_app_view_icon_save_image.png')} style={{width:30,height:30}} />
                            <Text style={{lineHeight:18,fontSize:12}}>保存到相册</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{alignItems:'center',marginLeft: 15}} onPress={()=>this._copyLink()}>
                            <Image source={require('../../../res/images/share/images_share_link.png')} style={{width:30,height:30}} />
                            <Text style={{lineHeight:18,fontSize:12}}>复制链接</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{alignItems:'center',marginLeft: 15}} onPress={()=>this._sharePage()}>
                            <Image source={require('../../../res/images/share/images_share_more.png')} style={{width:30,height:30}} />
                            <Text style={{lineHeight:18,fontSize:12}}>更多</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{backgroundColor:'#f1f1f1',flex:1}} />
                </ScrollView>
                <Toast
                    style={{opacity:0.6}}
                    textStyle={{color:'#FFF'}}
                    position={'bottom'}
                    ref="toast"
                />
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
        backgroundColor: '#7D3ED3',
        width:'100%',
    },
    navBarIcon:{
        fontSize:25,
        position: 'absolute',
        left:0,
        top:0,
        marginLeft:15,
        color:'#fff',
        lineHeight:44
    },
    navBarText:{
        color:'#fff',
        textAlign:'center',
        alignSelf:'center',
        lineHeight:44,
        fontSize: 18
    },

    txtTitle:{
        color:'#fff',
        textAlign:'center',
        fontSize:18,
        lineHeight:24
    },
    txtContent:{
        color:'#fff',
        fontSize:16,
        lineHeight:20
    }

});
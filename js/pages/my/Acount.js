import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Clipboard,
    ImageBackground,
    Dimensions,
    Image,
    CameraRoll,
    ActivityIndicator
} from 'react-native';
import Icon from "react-native-vector-icons/AntDesign";
import QRCode from 'react-native-qrcode';
import Theme, {createThemedComponent} from "react-native-theming";
import ViewShot, { captureScreen, captureRef } from "react-native-view-shot";

const { width, height } = Dimensions.get('window');
const MdSafeAreaView = createThemedComponent(SafeAreaView);
const MdTouchableOpacity =createThemedComponent(TouchableOpacity);

export default class Acount extends Component{

    constructor(props){
        super(props);
        this.state = {
            navbar_title:'账户信息',
            account:'',
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
        this.getAcount();
    }

    componentWillMount() {
	}

    componentWillUnmount() {
	}

    getAcount(){
        fetch(global.ActiveDomain+"/user/share", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                account: global.UniqueId,
            })
        })
            .then(response => response.json())
            .then(responseJson => {
                this.setState({
                    account:responseJson.data.account,
                    isLoading:false,
                });
                // return responseJson.data;
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
    }

    //保存图标
    _savePic(){
        let that = this;
        captureScreen('code', {
            format: "jpg",
            quality: 0.8,
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

    render(){
        //第一次加载等待的view
        if (this.state.isLoading && !this.state.error) {
            return this._renderLoadingView();
        } else if (this.state.error) {
            //请求失败view
            return this._renderErrorView();
        }

        return(
            <MdSafeAreaView style={{flex:1}} forceInset={{ bottom: 'never' }}>
                <Theme.View style={[styles.navBar,{backgroundColor:'@HeadColor'}]}>
                    <Icon onPress={()=>this.props.navigation.goBack()} name='left' style={styles.navBarIcon} />
                    <Text style={styles.navBarText}>{this.state.navbar_title}</Text>
                </Theme.View>
                <ImageBackground style={{flex:1,backgroundColor:'#333'}} resizeMode='cover' source={require('../../../res/images/common/account_bg.png')}>
                        <View style={{flex:1,alignItems: 'center',justifyContent:'center'}}>
                            <View ref='code' style={{backgroundColor:'#fff',borderRadius:10,height: 300,width: 270,padding: 10,marginTop:10}}>
                                <QRCode
                                    value={this.state.account}
                                    size={250}
                                    bgColor='#000'
                                    fgColor='white'/>
                                <Text style={{color:'#ccc',fontSize:13,textAlign:'center',marginTop:10}}>{this.state.account}</Text>
                            </View>
                            <View style={{padding: 10,flexDirection:'row'}}>
                                <TouchableOpacity onPress={()=>Clipboard.setString(this.state.account)} style={{backgroundColor: '#7D3ED3',height: 40,borderRadius: 20,marginTop: 0,width: width/3,marginTop:10}}>
                                    <Text style={{color: '#fff',fontSize: 16,lineHeight: 40,textAlign: 'center'}}>复制ID</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={()=>this._savePic()} style={{backgroundColor: '#7D3ED3',height: 40,borderRadius: 20,marginTop: 0,width: width/3,marginTop:10}}>
                                    <Text style={{color: '#fff',fontSize: 16,lineHeight: 40,textAlign: 'center'}}>保存凭证</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                </ImageBackground>
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
        borderBottomColor:'#ccc',
        borderBottomWidth: 1,
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
        fontSize: 18
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

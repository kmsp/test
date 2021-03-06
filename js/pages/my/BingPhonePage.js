import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    TextInput, Dimensions, Alert
} from 'react-native';
import Icon from "react-native-vector-icons/AntDesign";
import Toast, {DURATION} from 'react-native-easy-toast';
import Theme, {createThemedComponent} from "react-native-theming";
import {FetchRequest} from "../../util/FetchRequest";

const MdSafeAreaView = createThemedComponent(SafeAreaView);
const MdTouchableOpacity = createThemedComponent(TouchableOpacity);
const MdTextInput = createThemedComponent(TextInput,['placeholderTextColor']);

// 取得屏幕的宽高Dimensions
const { width, height } = Dimensions.get('window');

export default class BingPhonePage extends Component{

    constructor(props){
        super(props);
        this.state = {
            navbar_title:this.props.navigation.getParam('Type') === 1 ? '绑定手机' : '解绑手机',
            phoneCode:'',               //手机号码
            verificationCode:'',        //验证码
            getCodeMsg:'获取验证码',     //获取验证码提示信息
            sendCodeTime:60,            //获取验证码倒计时
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

    componentWillMount() {
        clearInterval(this.sendTime);
    }

    _sendMsg(){
        FetchRequest(
            global.ActiveDomain+'/send_code',
            'POST',
            {
                phone:this.state.phoneCode
            },
            (result)=>{
                if (result.code === 200){
                    this.refs.toast.show('发送成功，请输入验证码');
                    this.sendTime = setInterval(()=>{
                        if (this.state.sendCodeTime > 0) {
                            this.setState({
                                sendCodeTime:this.state.sendCodeTime,
                                getCodeMsg:'重发'+this.state.sendCodeTime+'秒'
                            })
                        }else{
                            clearInterval(this.sendTime);
                            this.setState({getCodeMsg:'获取验证码'})
                        }
                    },1000);
                } else {
                    //this.refs.toast.show(result.msg);
                    Alert.alert(
                        '温馨提示',
                        result.msg,
                        [
                            {text: '返回'},
                        ],
                        { cancelable: false }
                    )
                }
            },
            (error)=>{
                // this.refs.toast.show(error);
                Alert.alert(
                    '温馨提示',
                    error,
                    [
                        {text: '返回'},
                    ],
                    { cancelable: false }
                )
            }
        )
    }

    _doSafeCode(){
        FetchRequest(
            global.ActiveDomain+'/bind_phone',
            'POST',
            {
                account:global.UniqueId,
                phone:this.state.phoneCode,
                code:this.state.verificationCode,
                type:this.props.navigation.getParam('Type'),
            },
            (result)=>{
                if (result.code === 200){
                    this.props.navigation.getParam('Type') === 1 ?
                        global.PhoneNum = this.state.phoneCode
                        :
                        global.PhoneNum = null;
                    this.props.navigation.goBack();
                } else {
                    // this.refs.toast.show(result.msg);
                    Alert.alert(
                        '温馨提示',
                        result.msg,
                        [
                            {text: '返回'},
                        ],
                        { cancelable: false }
                    )
                }
            },
            (error)=>{
                // this.refs.toast.show(error);
                Alert.alert(
                    '温馨提示',
                    error,
                    [
                        {text: '返回'},
                    ],
                    { cancelable: false }
                )
            }
        );
    }

    render(){

        return(
            <MdSafeAreaView style={{flex:1,backgroundColor:'@BackgroundColor'}} forceInset={{ bottom: 'never' }}>
                <Theme.View style={[styles.navBar,{backgroundColor:'@HeadColor'}]}>
                    <Icon onPress={()=>this.props.navigation.goBack()} name='left' style={styles.navBarIcon}/>
                    <Text style={styles.navBarText}>{this.state.navbar_title}</Text>
                </Theme.View>
                <Theme.View style={{height:5,backgroundColor:'@JiangeColor'}} />
                {/*<ScrollView style={{flex:1}}>*/}
                <View style={{flex:1,alignItems: 'center',justifyContent:'center'}}>
                    <Theme.View style={{backgroundColor:'@BackgroundColor',paddingHorizontal: 10,flexDirection: 'row',justifyContent:'space-between',borderBottomWidth: 1,borderBottomColor:"@JiangeColor"}}>
                        <Theme.Text style={{fontSize:14,lineHeight:40,color:'@SearchBoxColor'}}>手机号</Theme.Text>
                        <MdTextInput
                            onChangeText={(text) => this.setState({phoneCode:text})}
                            placeholder={'请输入电话号码'}
                            placeholderTextColor={'@SearchBoxColor'}
                            keyboardType={'numeric'}
                            maxLength={11}
                            style={{flex:1,fontSize:14,lineHeight:40,height: 40,padding: 0,textAlign:'right'}}
                        />
                    </Theme.View>
                    <Theme.View style={{backgroundColor:'@BackgroundColor',paddingHorizontal: 10,flexDirection: 'row',alignItems:'center'}}>
                        <Theme.Text style={{fontSize:14,lineHeight:40,color:'@SearchBoxColor'}}>验证码</Theme.Text>
                        <MdTextInput
                            onChangeText={(text) => this.setState({verificationCode:text})}
                            placeholder={'输入验证码'}
                            placeholderTextColor={'@SearchBoxColor'}
                            keyboardType={'numeric'}
                            maxLength={6}
                            style={{flex:1,fontSize:14,lineHeight:40,height: 40,padding: 0,textAlign:'right',marginRight: 10}}
                        />
                        <Theme.Text style={{backgroundColor:'@ThemeColor',color:'#fff',paddingHorizontal:10,borderRadius:5,lineHeight:20,paddingVertical: 0,overflow:'hidden',fontSize:10}} onPress={()=>this._sendMsg()}>{this.state.getCodeMsg}</Theme.Text>
                    </Theme.View>
                    <Theme.View style={{flex:1,backgroundColor:'@JiangeColor',alignItems:'center',paddingHorizontal:20}}>
                        <Theme.Text style={{textAlign:'center',color:'@ThemeColor',lineHeight:40}}>注：手机是找回账户的重要依据</Theme.Text>
                        <MdTouchableOpacity onPress={() => this._doSafeCode()} style={{
                            backgroundColor: '@ThemeColor',
                            height: 40,
                            borderRadius: 20,
                            marginTop: 20,
                            width: width - 40
                        }}><Text style={{
                            color: '#fff',
                            fontSize: 16,
                            lineHeight: 40,
                            textAlign: 'center'
                        }}>提交</Text></MdTouchableOpacity>
                    </Theme.View>
                </View>
                {/*</ScrollView>*/}
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
        backgroundColor: '#000',
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

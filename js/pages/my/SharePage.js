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
    Share, Clipboard, DeviceEventEmitter
} from 'react-native';
import QRCode from 'react-native-qrcode';
import Icon from "react-native-vector-icons/AntDesign";
import Theme, {createThemedComponent} from "react-native-theming";
import {FetchRequest} from "../../util/FetchRequest";

// 取得屏幕的宽高Dimensions
const { width, height } = Dimensions.get('window');

const MdSafeAreaView = createThemedComponent(SafeAreaView);

export default class SharePage extends Component{

    constructor(props){
        super(props);
        this.state = {
            navbar_title:'分享推广',
            shareDate:[],
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

    componentWillMount(){
        this._getshareDate();
    }

    componentDidMount(){

    }

    //获取分享链接
    _getshareDate(){
        FetchRequest(
            global.ActiveDomain+"/shareurl",
            'post',
            {
                invite_code: global.InviteCode,
            },
            (result)=>{
                if (result.code === 200){
                    this.setState({
                        shareDate:result.data[0],
                        isLoading:false
                    });
                } else {

                }
            },
            (error)=>{
                this.setState({
                    isLoading:false,
                    error:error,
                });
                this.props.navigation.goBack();
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

    //复制链接
    _copyLink(){
        FetchRequest(
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

    render(){

        return(
            <MdSafeAreaView style={{flex:1}} forceInset={{ bottom: 'never' }}>
                <Theme.View style={[styles.navBar,{backgroundColor:'@HeadColor'}]}>
                    <Icon onPress={()=>this.props.navigation.goBack()} name='left' style={styles.navBarIcon}/>
                    <Text style={styles.navBarText}>{this.state.navbar_title}</Text>
                </Theme.View>
                <ImageBackground source={require('../../../res/images/share/images_promotion_bg.png')} resizeMode='cover' style={{flex: 1, backgroundColor: "transparent"}}>
                    <TouchableOpacity onPress={()=>this._copyLink()} style={{backgroundColor:'#7D3ED3',height:40,paddingHorizontal: 15,borderRadius:20,position: 'absolute',bottom:40,alignSelf: 'center',zIndex: 100}}>
                        <Text style={{color:'#fff',fontSize:16,lineHeight:40}}>点击复制推广链接</Text>
                    </TouchableOpacity>
                    <View style={{height:height,alignItems: 'center',backgroundColor:'rgba(0,0,0,0.5)'}}>
                        <View style={{width:350,marginTop:10}}>
                            <Text style={styles.txtTitle}>海量视频  免费观看</Text>
                        </View>
                        <View style={{width:350,marginTop:10}}>
                            <Text style={styles.txtContent}>推广1人，每日观影次数+3，周缓存+1</Text>
                            <Text style={styles.txtContent}>推广3人，每日观影次数+5，周缓存+3</Text>
                            <Text style={styles.txtContent}>推广10人，每日观影次数+30，周缓存+10</Text>
                            <Text style={styles.txtContent}>推广30人，每日观影次数+50，周缓存+30</Text>
                            <Text style={styles.txtContent}>推广50人，每日观影次数无限，周缓存+50</Text>
                        </View>
                        <View style={{backgroundColor:'#fff',borderRadius:10,height: 180,width: 180,padding: 10,marginTop:10}}>
                            <QRCode
                                value={this.state.shareDate.url}
                                size={160}
                                bgColor='#000'
                                fgColor='white'
                            />
                        </View>
                        <Text style={{color:'#fff',fontSize:20,marginTop:10}}>我的邀请码：{global.InviteCode}</Text>
                        <View style={{width:350,marginTop:10}}>
                            <Text style={[styles.txtContent,{color:'red'}]}>注：充值会员本来就是无限了，以上福利只是针对非会员且该片次数不能看VIP的片源</Text>
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
        backgroundColor: '#7D3ED3',
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
        fontSize:18,
        lineHeight:24
    },
    txtContent:{
        color:'#fff',
        fontSize:16,
        lineHeight:30,
        textAlign:'center',
    }

});

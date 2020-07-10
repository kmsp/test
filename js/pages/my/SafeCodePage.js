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
import md5 from "react-native-md5";
import {FetchRequest} from "../../util/FetchRequest";

const MdSafeAreaView = createThemedComponent(SafeAreaView);
const MdTouchableOpacity = createThemedComponent(TouchableOpacity);
const MdTextInput = createThemedComponent(TextInput,['placeholderTextColor']);

// 取得屏幕的宽高Dimensions
const { width, height } = Dimensions.get('window');

export default class SafeCodePage extends Component{

    constructor(props){
        super(props);
        this.state = {
            navbar_title:'安全码设置',
            safeCode:0,
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

    }

    _alertMsg(){
        if (this.state.safeCode.length < 17 && this.state.safeCode.length >5){
            Alert.alert(
                '提示',
                '请妥善保管你的安全码，不要泄露给他人，确认设置吗?',
                [
                    {text: '取消', onPress: () => console.log('Cancel Pressed')},
                    {text: '确认', onPress: () => this._doSafeCode()},
                ],
                { cancelable: false }
            )
        } else {
            Alert.alert(
                '提示',
                '请输入安全码，由6-16位数字组成',
                [
                    {text: '取消', onPress: () => console.log('Cancel Pressed')},
                ],
                { cancelable: false }
            )
        }

    }


    _doSafeCode(){
        FetchRequest(
            global.ActiveDomain+"/pay_pass",
            'POST',
            {
                account:global.UniqueId,
                pass:this.state.safeCode,
            },
            (result)=>{
                if (result.code === 200){
                    Alert.alert(
                            '提示',
                            '安全码已经设置成功，您的安全码是：'+this.state.safeCode,
                            [
                                {text: '确定', onPress: () => this.props.navigation.goBack()},
                            ],
                            { cancelable: false }
                        )
                    global.TixianCode=md5.hex_md5(md5.hex_md5(this.state.safeCode));
                    this.props.navigation.goBack();
                } else {
                    this.refs.toast.show(result.msg);
                }
            },
            (error)=>{
                this.refs.toast.show(error);
            }
        );
    }

    render(){

        return(
            <MdSafeAreaView style={{flex:1,backgroundColor:'@BackgroundColor'}} forceInset={{ bottom: 'never' }}>
                <Theme.View style={[styles.navBar,{backgroundColor:'@HeadColor'}]}>
                    <Icon onPress={()=>this.props.navigation.goBack()} name='left' style={styles.navBarIcon}/>
                    <Text style={styles.navBarText}>{this.state.navbar_title}</Text>
                    <Text style={{position: 'absolute', right:0, top:0, marginRight:15, color:'#fff', lineHeight:44,fontSize:12}} onPress={()=>this.props.navigation.navigate('RestSafeCodePage')}>重置</Text>
                </Theme.View>
                {/*<ScrollView style={{flex:1}}>*/}
                    <View style={{flex:1,alignItems: 'center',justifyContent:'center'}}>
                        {
                            global.TixianCode ?
                                <Theme.View style={{height: 40,paddingHorizontal: 20,width: width,alignItems:'center',backgroundColor:'@BackgroundColor',flexDirection: 'row',justifyContent:'space-between'}}>
                                    <Theme.Text style={{color:'@TextColor'}}>安全码已设置</Theme.Text>
                                    <Theme.Text style={{backgroundColor:'@ThemeColor',color:'#fff',paddingHorizontal:10,borderRadius:5,lineHeight:20,paddingVertical: 0,overflow:'hidden',fontSize:13}} onPress={()=>this.props.navigation.navigate('ChangeSafeCodePage')}>修改安全码</Theme.Text>
                                    <Theme.Text style={{backgroundColor:'@ThemeColor',color:'#fff',paddingHorizontal:10,borderRadius:5,lineHeight:20,paddingVertical: 0,overflow:'hidden',fontSize:13}} onPress={()=>this.props.navigation.navigate('RestSafeCodePage')}>重置安全码</Theme.Text>
                                </Theme.View>
                                :
                                <MdTextInput
                                    onChangeText={(text) => this.setState({safeCode:text})}
                                    placeholder={'请输入安全码，由6-16位数字组成'}
                                    placeholderTextColor={'@SearchBoxColor'}
                                    keyboardType={'numeric'}
                                    maxLength={16}
                                    style={{fontSize:14,lineHeight:40,height: 40,padding: 0,paddingHorizontal: 20,width: width,backgroundColor:'@BackgroundColor'}}
                                />

                        }
                        <Theme.View style={{flex:1,backgroundColor:'@JiangeColor',alignItems:'center'}}>
                            {
                                global.TixianCode ?
                                    null
                                    :
                                    <MdTouchableOpacity onPress={() => this._alertMsg()} style={{
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
                            }
                                    <Text style={{color:'red',fontSize:12,textAlign:'center',paddingHorizontal:20,marginTop:10}}>#安全码用途:提现时需要输入安全码才能完成操作，所以请妥善保管也不要泄露给他人</Text>
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
        fontSize:14,
        lineHeight:18
    },
    txtContent:{
        color:'#fff',
        fontSize:12,
        lineHeight:16
    }

});
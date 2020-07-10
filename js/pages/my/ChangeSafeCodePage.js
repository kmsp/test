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
import Orientation from 'react-native-orientation';

const MdSafeAreaView = createThemedComponent(SafeAreaView);
const MdTouchableOpacity = createThemedComponent(TouchableOpacity);
const MdTextInput = createThemedComponent(TextInput,['placeholderTextColor']);

// 取得屏幕的宽高Dimensions
const { width, height } = Dimensions.get('window');

export default class ChangeSafeCodePage extends Component{

    constructor(props){
        super(props);
        this.state = {
            navbar_title:'修改密码',
            oldPass:'',     //原密码
            newPass:'',     //新密码
            rNewPass:'',    //重复新密码
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
        Orientation.lockToPortrait();

    }


    _doChangePass(){
        if (this.state.oldPass.length === 0 || this.state.newPass.length === 0 || this.state.rNewPass.length === 0){
            // alert('请输入密码');
            Alert.alert(
                '温馨提示',
                '请输入密码',
                [
                    {text: '返回'},
                ],
                { cancelable: false }
            )
        }
        if (this.state.newPass !== this.state.rNewPass){
            // alert('两次新密码不一致，请重新输入。')
            Alert.alert(
                '温馨提示',
                '两次新密码不一致，请重新输入。',
                [
                    {text: '返回'},
                ],
                { cancelable: false }
            )
        }
        FetchRequest(
            global.ActiveDomain+"/pay_pass",
            'POST',
            {
                account:global.UniqueId,
                pass:this.state.newPass,
                oldpass:this.state.oldPass,
            },
            (result)=>{
                if (result.code === 200){
                    // alert('修改密码成功');
                    Alert.alert(
                        '温馨提示',
                        '修改密码成功',
                        [
                            {text: '确定'},
                        ],
                        { cancelable: false }
                    );
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
                </Theme.View>
                {/*<ScrollView style={{flex:1}}>*/}
                <View style={{flex:1,alignItems: 'center',justifyContent:'center'}}>
                    <Theme.View style={{backgroundColor:'@BackgroundColor',paddingHorizontal: 10,flexDirection: 'row',justifyContent:'space-between',borderBottomWidth: 1,borderBottomColor:"@JiangeColor"}}>
                        <Theme.Text style={{fontSize:14,lineHeight:40,color:'@SearchBoxColor'}}>原密码</Theme.Text>
                        <MdTextInput
                            onChangeText={(text) => this.setState({oldPass:text})}
                            placeholder={'请输入原安全码'}
                            placeholderTextColor={'@SearchBoxColor'}
                            keyboardType={'numeric'}
                            maxLength={16}
                            secureTextEntry={true}
                            style={{flex:1,fontSize:14,lineHeight:40,height: 40,padding: 0,textAlign:'right'}}
                        />
                    </Theme.View>
                    <Theme.View style={{backgroundColor:'@BackgroundColor',paddingHorizontal: 10,flexDirection: 'row',justifyContent:'space-between',borderBottomWidth: 1,borderBottomColor:"@JiangeColor"}}>
                        <Theme.Text style={{fontSize:14,lineHeight:40,color:'@SearchBoxColor'}}>新密码</Theme.Text>
                        <MdTextInput
                            onChangeText={(text) => this.setState({newPass:text})}
                            placeholder={'请输入新密码'}
                            placeholderTextColor={'@SearchBoxColor'}
                            keyboardType={'numeric'}
                            maxLength={16}
                            secureTextEntry={true}
                            style={{flex:1,fontSize:14,lineHeight:40,height: 40,padding: 0,textAlign:'right'}}
                        />
                    </Theme.View>
                    <Theme.View style={{backgroundColor:'@BackgroundColor',paddingHorizontal: 10,flexDirection: 'row',justifyContent:'space-between',borderBottomWidth: 1,borderBottomColor:"@JiangeColor"}}>
                        <Theme.Text style={{fontSize:14,lineHeight:40,color:'@SearchBoxColor'}}>重复新密码</Theme.Text>
                        <MdTextInput
                            onChangeText={(text) => this.setState({rNewPass:text})}
                            placeholder={'请输入重复输入新密码'}
                            placeholderTextColor={'@SearchBoxColor'}
                            keyboardType={'numeric'}
                            maxLength={16}
                            secureTextEntry={true}
                            style={{flex:1,fontSize:14,lineHeight:40,height: 40,padding: 0,textAlign:'right'}}
                        />
                    </Theme.View>
                    <Theme.View style={{flex:1,backgroundColor:'@JiangeColor',alignItems:'center',paddingHorizontal:20}}>
                        <MdTouchableOpacity onPress={() => this._doChangePass()} style={{
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

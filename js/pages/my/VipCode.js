import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    TextInput, Dimensions
} from 'react-native';
import Icon from "react-native-vector-icons/AntDesign";
import Toast, {DURATION} from 'react-native-easy-toast';
import Theme, {createThemedComponent} from "react-native-theming";
import {FetchRequest} from "../../util/FetchRequest";

const MdSafeAreaView = createThemedComponent(SafeAreaView);
const MdTouchableOpacity = createThemedComponent(TouchableOpacity);

// 取得屏幕的宽高Dimensions
const { width, height } = Dimensions.get('window');

export default class VipCode extends Component{

    constructor(props){
        super(props);
        this.state = {
            navbar_title:'输入激活码 ',
            vipcode:'',
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


    _doVip(){
        FetchRequest(global.ActiveDomain+"/Activation_code",
            "ENCRYPTO",
            {
                code: this.state.vipcode,
                account: global.UniqueId,
            },
            (responseJson) => {
                if (responseJson.code === 200){
                    this.setState({ doShareCode: false });
                    this.refs.toast.show('兑换成功');
                }else{
                    this.setState({ doShareCode: false });
                    this.refs.toast.show(responseJson.msg);
                }
            },
            (error) => {
                this.setState({ doShareCode: false });
                this.refs.toast.show(error);
                console.error(error);
            }
        )
    }

    render(){

        return(
            <MdSafeAreaView style={{flex:1,backgroundColor:'@BackgroundColor'}} forceInset={{ bottom: 'never' }}>
                <Theme.View style={[styles.navBar,{backgroundColor:'@HeadColor'}]}>
                    <Icon onPress={()=>this.props.navigation.goBack()} name='left' style={styles.navBarIcon}/>
                    <Text style={styles.navBarText}>{this.state.navbar_title}</Text>
                </Theme.View>
                <ScrollView style={{flex:1}}>
                    <View style={{flex:1,alignItems: 'center',justifyContent:'center'}}>
                        <TextInput
                            onChangeText={(text) => this.setState({vipcode:text})}
                            placeholder={'请输入兑换码'}
                            placeholderTextColor={'#7D3ED3'}
                            style={{borderRadius:20,fontSize:16,lineHeight:40,borderWidth:1,borderColor:'#eee',height: 40,padding: 0,paddingHorizontal: 20,width: width-40,marginTop:40}}
                        />
                        <MdTouchableOpacity onPress={()=>this._doVip()} style={{backgroundColor:'@ThemeColor',height:40,borderRadius:20,marginTop:30,width: width-40}}><Text style={{color:'#fff',fontSize:16,lineHeight:40,textAlign:'center'}}>确定</Text></MdTouchableOpacity>
                    </View>
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

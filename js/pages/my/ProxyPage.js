import React, {Component} from 'react';
import {
    SafeAreaView,
    AppRegistry,
    StyleSheet,
    Dimensions,
    Text,
    View,
    WebView
} from 'react-native';
import Icon from "react-native-vector-icons/AntDesign";
import Theme, {createThemedComponent} from "react-native-theming";
import Orientation from 'react-native-orientation';

//获取设备的宽度和高度
var {
    height: deviceHeight,
    width: deviceWidth
} = Dimensions.get('window');

 const MdSafeAreaView = createThemedComponent(SafeAreaView);
//默认应用的容器组件
export default class Kefu extends Component{
    constructor(props){
        super(props);
        this.state = {
            navbar_title:'代理招募',
            Date:[],
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
        Orientation.lockToPortrait();
        //alert(global.url);

    }

    componentDidMount(){
        //this._getshareDate();
    }

    //渲染
    render() {
        return (
            <MdSafeAreaView style={{flex:1,backgroundColor:'@BackgroundColor'}} forceInset={{ bottom: 'never' }}>
                <Theme.View style={[styles.navBar,{backgroundColor:'@HeadColor'}]}>
                    <Icon onPress={()=>this.props.navigation.goBack()} name='left' style={styles.navBarIcon}/>
                    <Text style={styles.navBarText}>{this.state.navbar_title}</Text>
                </Theme.View>
                <View style={styles.container}>
                  <WebView bounces={false}
                    scalesPageToFit={true}
                    source={{uri:this.props.navigation.getParam('Agent_link'),method: 'GET'}}
                    style={{width:deviceWidth, height:deviceHeight}}>
                  </WebView>
                </View>
            </MdSafeAreaView>
        );
    }
}

//样式定义
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop:0
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

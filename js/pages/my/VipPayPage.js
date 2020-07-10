import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Clipboard,
    ActivityIndicator,
    Image
} from 'react-native';
import Icon from "react-native-vector-icons/AntDesign";
import Theme, {createThemedComponent} from "react-native-theming";

const MdSafeAreaView = createThemedComponent(SafeAreaView);
const MdScrollView = createThemedComponent(ScrollView);
const Button = createThemedComponent(TouchableOpacity);

export default class VipPayPage extends Component{

    constructor(props){
        super(props);
        this.state = {
            navbar_title:'支付信息',
            payImage:'',
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
        this.getPay();
        this.getAcount();
    }

    getPay(){
        fetch(global.ActiveDomain+"/payment", {
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
                this.setState({
                    payImage:responseJson.data,
                    isLoading:false,
                });
                // return responseJson.data;
            })
            .catch(error => {
                console.error(error);
            });
    }

    getAcount(){
        fetch(global.ActiveDomain+"/user/share", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                account: global.UniqueId
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
                console.error(error);
            });
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
            <MdSafeAreaView style={{flex:1,backgroundColor:'@BackgroundColor'}} forceInset={{ bottom: 'never' }}>
                <Theme.View style={[styles.navBar,{backgroundColor:'@ThemeColor'}]}>
                    <Icon onPress={()=>this.props.navigation.goBack()} name='left' style={styles.navBarIcon} />
                    <Text style={styles.navBarText}>{this.state.navbar_title}</Text>
                </Theme.View>
                <ScrollView style={{flex:1}}>
                    <View style={{flex:1,alignItems: 'center',justifyContent:'center'}}>
                        <Theme.Text style={{color:'@TextColor',fontSize:18,textAlign: 'center',marginTop: 30}}>扫描下方二维码进行支付</Theme.Text>
                        <View style={{backgroundColor:'#fff',borderRadius:10,height: 220,width: 220,padding: 10,marginTop:10}}>
                            <Image source={{uri:((state.payImage).startsWith('http') ? state.payImage : global.ActiveDomain + state.payImage)}} style={{width:200,height:200}} />
                        </View>
                        <Theme.Text style={{color:'@TextColor',fontSize:16,marginTop:10}}>支付时请备注您的账户</Theme.Text>

                        <Theme.Text style={{color:'@TextColor',fontSize:16,marginTop:10}}>当前账号：{this.state.account}</Theme.Text>
                        <Button onPress={()=>Clipboard.setString(this.state.account)} style={{backgroundColor:'@ThemeColor',padding:6,paddingLeft:16,paddingRight:16,borderRadius:4,marginTop:10}}><Text style={{color:'#fff',fontSize:16,lineHeight:20}}>复制</Text></Button>
                    </View>
                </ScrollView>
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
        // borderBottomColor:'#999',
        // borderBottomWidth: 1
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
        fontSize:14,
        lineHeight:18
    },
    txtContent:{
        color:'#fff',
        fontSize:12,
        lineHeight:16
    }

});
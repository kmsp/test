import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert} from 'react-native';
import {QRscanner,QRreader} from 'react-native-qr-scanner';
import ImagePicker from 'react-native-image-picker';
import Icon from "react-native-vector-icons/AntDesign";
import Theme,{createThemedComponent} from "react-native-theming";
import {FetchRequest} from "../../util/FetchRequest";

const MdSafeAreaView = createThemedComponent(SafeAreaView);

export default class ScanCode extends Component {
    constructor(props) {
        super(props);
        this.state = {
            navbar_title:'扫码登陆',
            flashMode: false,
            zoom: 0.2
        };

        //隐藏底部导航栏
        this.props.navigation.setParams({
            fullscreen: false,
        })
    }

    //切换账户
    onRead = (res) => {
        FetchRequest(
            global.ActiveDomain+"/Change_accounts",
            "ENCRYPTO",
            {
                change_account: res.data,
                account: global.UniqueId,
            },
            (responseJson) => {
                console.log('scancode',responseJson)
                if (responseJson.code == 200){
                    Alert.alert(
                        '提示',
                        '扫码登陆成功！',
                        [
                            {text: '确定', onPress: () => this.props.navigation.goBack()},
                        ],
                        { cancelable: false }
                    )
                    //成功，返回 我的
                    this.props.navigation.goBack();
                }else{
                    //更换失败
                    Alert.alert(
                        '提示',
                        '登陆失败，请重试！',
                        [
                            {text: '确定', onPress: () => this.props.navigation.goBack()},
                        ],
                        { cancelable: false }
                    )
                    this.props.navigation.goBack();
                }
            },
            (error) => {
                Alert.alert(
                    '提示',
                    '登陆失败，请重试！',
                    [
                        {text: '确定', onPress: () => this.props.navigation.goBack()},
                    ],
                    { cancelable: false }
                )
                console.error(error);
            }
        )

    }
    //读取二维码图片
    openPhoto() {
        ImagePicker.launchImageLibrary({}, (response) => {

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                if (response.uri) {
                    var path = response.path;
                    if (!path) {
                        path = response.uri;
                    }
                    QRreader(path).then((data) => {
                        FetchRequest(
                            global.ActiveDomain+"/Change_accounts",
                            "ENCRYPTO",
                            {
                                change_account: data.toString(),
                                account: global.UniqueId,
                            },
                            (responseJson) => {
                              console.log('scancode',responseJson)

                                if (responseJson.code == 200){
                                    //成功，返回 我的
                                    Alert.alert(
                                        '提示',
                                        '扫码登陆成功！',
                                        [
                                            {text: '确定', onPress: () => this.props.navigation.goBack()},
                                        ],
                                        { cancelable: false }
                                    )
                                    this.props.navigation.goBack();
                                }else{
                                    //更换失败
                                    Alert.alert(
                                        '提示',
                                        '登陆失败，请重试！',
                                        [
                                            {text: '确定', onPress: () => this.props.navigation.goBack()},
                                        ],
                                        { cancelable: false }
                                    )
                                }
                            },
                            (error) => {
                                Alert.alert(
                                    '提示',
                                    '登陆失败，请重试！',
                                    [
                                        {text: '确定', onPress: () => this.props.navigation.goBack()},
                                    ],
                                    { cancelable: false }
                                )
                                console.error(error);
                            }
                        )
                    }).catch((err) => {
                        Alert.alert(
                            '提示',
                            '识别失败，请重试！',
                            [
                                {text: '确定', onPress: () => this.props.navigation.goBack()},
                            ],
                            { cancelable: false }
                        )
                    });

                }
            }
        });
    }

    render() {
        return (
            <MdSafeAreaView style={{flex:1,backgroundColor:'@BackgroundColor'}} forceInset={{ bottom: 'never' }}>
                <Theme.View style={[styles.navBar,{backgroundColor:'@HeadColor'}]}>
                    <Icon onPress={()=>this.props.navigation.goBack()} name='left' style={styles.navBarIcon} />
                    <Text style={styles.navBarText}>{this.state.navbar_title}</Text>
                </Theme.View>
                <View style={styles.container}>
                    <QRscanner onRead={this.onRead} renderBottomView={this.bottomView} flashMode={this.state.flashMode} zoom={this.state.zoom} finderY={50}/>
                </View>
            </MdSafeAreaView>
        );
    }
    bottomView = ()=>{
        return(
            <View style={{flex:1,flexDirection:'row',backgroundColor:'#0000004D'}}>
                <TouchableOpacity style={{flex:1,alignItems:'center', justifyContent:'center'}} onPress={()=>this.openPhoto()}>
                    <Text style={{color:'#fff'}}>打开相册/识别二维码</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{flex:1,alignItems:'center', justifyContent:'center'}} onPress={()=>this.setState({flashMode:!this.state.flashMode})}>
                    <Text style={{color:'#fff'}}>点我开启/关闭手电筒</Text>
                </TouchableOpacity>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000'
    },
    //顶部navBar样式
    navBar: {
        height: 44,
        width:'100%',
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

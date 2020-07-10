import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    Dimensions,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Linking
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from "react-native-vector-icons/AntDesign";
import Theme, {createThemedComponent} from "react-native-theming";
import {FetchRequest} from "../../util/FetchRequest";

const MdSafeAreaView = createThemedComponent(SafeAreaView);
const Button = createThemedComponent(TouchableOpacity);

const { width, height } = Dimensions.get('window');

export default class VipShowPage extends Component{

    constructor(props){
        super(props);
        this.state={
            VipListDate:[],
            payDomain:'',
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

    }

    componentDidMount(){
        this._getVipDate();
        this._getPayDomain();
    }

    _getPayDomain(){
        FetchRequest(global.ActiveDomain+"/Buy_member",
            "ENCRYPTO",
            {},
            (responseJson) => {
                this.setState({
                    payDomain:responseJson.url,
                    isLoading:false,
                });
                // return responseJson.data;
            },
            (error) => {
                Alert.alert(
                    '温馨提示',
                    '数据获取异常，请检查网络，code'+error,
                    [
                        {text: '返回'},
                    ],
                    { cancelable: false }
                )
            }
        )
    }
    _getVipDate(){
        FetchRequest(
            global.ActiveDomain+"/vip",
            'post',
            {},
            (result)=>{
                if (result.code === 200){
                    this.setState({
                        VipListDate:result.data,
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
                <Theme.View style={[styles.navBar,{backgroundColor:'@HeadColor'}]}>
                    <Icon onPress={()=>this.props.navigation.goBack()} name='left' style={styles.navBarIcon} />
                    <Text style={styles.navBarText}>购买会员</Text>
                </Theme.View>
                <ScrollView style={{flex:1}}>
                {
                    this.state.VipListDate.map((value, index) =>
                        <View key={index}>
                            <View style={[styles.buylist,{marginLeft: 10}]}>
                                <View style={{backgroundColor:'#7D3ED3',paddingHorizontal:5,height:width/17.7,borderRadius:5,width:60}}>
                                        <Text style={{color:'#fff',fontSize:12,margin:0,lineHeight:20}}>限时优惠</Text>
                                </View>
                                <View style={{flexDirection: 'row',justifyContent: 'space-between',marginLeft: 10}}>
                                    <Theme.Text style={{fontSize:20,color:'@TextColor'}}>{value.name}   <Text style={{color:'#7D3ED3'}}>¥{value.money}</Text></Theme.Text>
                                    <Button
                                        onPress={()=>Linking.openURL(this.state.payDomain+'/recharge?account='+global.UniqueId+'&vip_id='+value.id)}
                                        style={{backgroundColor:'@ThemeColor',paddingHorizontal:20,height:width/13,borderRadius:20}}
                                    ><Text style={{fontSize:15,color:'#fff',lineHeight:30}}>购买</Text></Button>
                                </View>
                                <Theme.Text style={{paddingHorizontal:10,fontSize:12,lineHeight:20,color:'@TextColor'}}>{value.des}</Theme.Text>
                            </View>
                        </View>
                    )
                }
                </ScrollView>
            </MdSafeAreaView>
        )
    }


}

const styles = StyleSheet.create({
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
    buylist:{
        width:(width-20),
        height:(width-10)/5,
        padding:4,
        borderColor: '#ccc',
        borderWidth: 1,
        margin:5,
        borderRadius:13,
        overflow:'hidden',
        textAlign:'center'
    },
    txtContent:{
        color:'#fff',
        fontSize:16,
        lineHeight:30
    }
})

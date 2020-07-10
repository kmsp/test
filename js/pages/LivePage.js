import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Dimensions,
    Share,
    Image,
    Linking,
    CameraRoll,
    FlatList
} from 'react-native';
import Theme,{createThemedComponent} from "react-native-theming";
import Icon from "react-native-vector-icons/FontAwesome5";
import FastImage from 'react-native-fast-image';
import {FetchRequest} from "../util/FetchRequest";
import Orientation from 'react-native-orientation';
import NoNetworkContainer from '../common/NoNetwork';


const MdSafeAreaView = createThemedComponent(SafeAreaView);
const MdTouchableOpacity = createThemedComponent(TouchableOpacity);
const MdIcon = createThemedComponent(Icon,['color']);

// 取得屏幕的宽高Dimensions
const { width, height } = Dimensions.get('window');
let pageNo = 0;//当前第几页
let itemNum = 6;    //一页显示数量

export default class LivePage extends Component{
    constructor(props){
        super(props);
        this.state = {
            listDate:[],
            number:[],
            ad:[],
            isLoading: true,
            //网络请求状态
            error: false,
            errorInfo: "",
            showFoot:0, // 控制foot， 0：隐藏footer  1：已加载完成,没有更多数据   2 ：显示加载中
            isRefreshing:false,//下拉控制
            endPage:false, //是否到达最后一页
            isRefresh:false,
        };
    }

    componentDidMount() {
        this.getData(pageNo);
        this.getad();
    }

    componentWillMount() {
       Orientation.lockToPortrait();
    }

    componentWillUnmount(){
        pageNo = 0;
        Orientation.lockToPortrait();
    }

    getData( pageNo ) {
        FetchRequest(
            global.ActiveDomain+'/pingtai',
            'POST',
            {
                page:pageNo,
                num:itemNum
            },
            (result)=>{
                if (result.code === 200){
                    let dataBlob = [];
                    if (pageNo === 0){
                        dataBlob = result.data;
                    } else {
                        dataBlob = this.state.listDate.concat(result.data);
                    }
                    let foot = 0;
                    let endpage = false;
                    if(result.data.length < itemNum){
                        foot = 1;//listView底部显示没有更多数据了
                        endpage = true; //已经最后一页了
                    }
                    this.setState({
                        //复制数据源
                        listDate:dataBlob,
                        isLoading: false,
                        showFoot:foot,
                        isRefreshing:false,
                        endPage:endpage,
                    });
                    dataBlob = null;
                }else{
                    this.setState({
                      isLoading: false,
                      showFoot: 0,
                      isRefreshing:false,
                    });
                }
            },
            (error)=>{
                this.setState({
                    error: true,
                    errorInfo: error
                })

            }
        )
    };

    getad() {
        FetchRequest(
            global.ActiveDomain+"/Platform",
            "ENCRYPTO",
            {},
            (responseJson) => {
                this.setState({
                    number:responseJson.number,
                    ad:responseJson.ad[0],
                });

            },
            (error) => {
                console.error(error);

            }
        )
    };
    //下拉刷新
    _onRefresh=()=>{
        // 不处于 下拉刷新
        if(!this.state.isRefresh){
            pageNo = 0;
            this.getData(pageNo);
        }
    };


    //点击广告
    _clickAd(item){
        FetchRequest(global.ActiveDomain+"/Advertising_records",
            "ENCRYPTO",
            {
                a_id: item.id,
                account: global.UniqueId,
            },
            (responseJson) => {
                if (responseJson.code === 200){

                    Linking.openURL(item.url)

                }else{

                }
            },
            (error) => {
                console.error(error);
            }
        )

    };



    //加载失败view
    _renderErrorView() {
      return (
        <Theme.View style={{alignItems:'center', justifyContent: 'center',backgroundColor:'@BackgroundColor',flex:1}}>
          <NoNetworkContainer navigate={this.props.navigation.navigate}/>
        </Theme.View>
      );
    }

    //上拉加载更多
    _onEndReached(){
        //如果是正在加载中或没有更多数据了，则返回
        if(this.state.showFoot !== 0 ){
            return ;
        }
        //如果当前页大于或等于总页数，那就是到最后一页了，返回
        if((pageNo !== 0) && (this.state.endPage)){
            return;
        } else {
            pageNo++;
        }
        //底部显示正在加载更多数据
        this.setState({showFoot:2});
        //获取数据
        this.getData( pageNo );
    }

    _renderFooter(){
        if (this.state.showFoot === 1) {
            return null;
                //<View style={{height:30,alignItems:'center',justifyContent:'flex-start',}}>
                    //<Text style={{color:'#999999',fontSize:14,marginTop:5,marginBottom:5,}}>
                    //</Text>
                //</View>
        } else if(this.state.showFoot === 2) {
            return (
                <View style={{alignItems:'center',justifyContent:'flex-start',}}>
                    <ActivityIndicator
                        animating={true}
                        color='#7D3ED3'
                    />
                    <Text style={{color:'#999999',fontSize:14,marginTop:5,marginBottom:5,}}>正在加载更多数据...</Text>
                </View>
            );
        } else if(this.state.showFoot === 0){
            return null;
        }
    }



    render() {
        if (this.state.error) {
            //请求失败view
            return this._renderErrorView();
        }

        return(
            <MdSafeAreaView style={{flex:1,backgroundColor:'@BackgroundColor'}} forceInset={{ bottom: 'never' }}>
                <View style={{flexDirection: 'row',padding: 10}}>
                    <MdIcon name={'bullhorn'} size={14} color={'@ThemeColor'} />
                    <Theme.Text style={{marginLeft: 10,color:'@ThemeColor'}}>内容与本平台无关,请忽相信广告。</Theme.Text>
                </View>
                {
                    this.state.ad.img ?
                        <View style={{flexDirection: 'row',padding: 10}}>
                            <TouchableOpacity activeOpacity={1} onPress={()=>this._clickAd(this.state.ad)}>
                                <FastImage source={{uri:this.state.ad.img}} resizeMode={'cover'} style={{width:width-20,height:(width-20)/5.03125,borderRadius:5}} />
                            </TouchableOpacity>
                        </View>
                    :
                    null
                }

                <View style={{flexDirection:'row',padding: 10,borderBottomWidth: 1,borderBottomColor:'#ccc',}}>
                    <View style={{flexDirection:'row',alignItems:'center',flex:1}}>
                        <MdIcon name={'caret-right'} size={16} color={'@ThemeColor'} />
                        <Theme.Text style={{fontSize:16,color:'@TextColor',marginLeft:10}}>直播机构({this.state.number}家)</Theme.Text>
                        <Theme.Text style={{backgroundColor:'@ThemeColor',color:'@WriteTextColor',borderRadius:4,overflow: 'hidden',padding:2,marginLeft:10}}>持续增加</Theme.Text>
                    </View>
                    {/*<Theme.Text style={{color:'@LabelTextColor'}}>共{this.state.number}个</Theme.Text>*/}
                </View>
                <Theme.View style={{flex:1}}>
                    <FlatList
                        data={this.state.listDate}
                        keyExtractor={(item, index) => item.id.toString()+'-'+index}
                        renderItem={(item)=>
                            <MdTouchableOpacity onPress={()=>this.props.navigation.navigate('LiveListPage',{Pid:item.item.id,Ptitle:item.item.title,Pphoto: item.item.img,Pcount:item.item.zhubo_count})} style={{width:width/3,marginTop:-1,alignItems:'center',backgroundColor:'@BackgroundColor',marginLeft:-1,paddingVertical: 10,borderColor:'#eaeaea',borderWidth:1}}>
                                <FastImage source={{uri:item.item.img}} resizeMode={'cover'} style={{width:50,height:50,borderRadius:5}} />
                                <Theme.Text style={{fontSize:10,color:'@TextColor',lineHeight:15}} numberOfLines={1}>{item.item.title}</Theme.Text>
                                <Theme.Text style={{fontSize:10,color:'@WriteTextColor',backgroundColor:"@ThemeColor",lineHeight:13,borderRadius:5,paddingHorizontal: 10,overflow:'hidden',marginTop:3}}>{item.item.zhubo_count}</Theme.Text>
                            </MdTouchableOpacity>
                        }
                        numColumns={3}
                        initialNumToRender={1}
                        horizontal={false}
                        //上拉加载
                        ListFooterComponent={this._renderFooter.bind(this)}
                        onEndReached={this._onEndReached.bind(this)}
                        onEndReachedThreshold={0.1}
                        //下拉刷新相关
                        onRefresh={() => this._onRefresh()}
                        refreshing={this.state.isRefresh}
                    />
                </Theme.View>
            </MdSafeAreaView>
        )
    }
}

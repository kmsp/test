import React, {Component} from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Dimensions,
    FlatList, StyleSheet
} from 'react-native';
import Theme,{createThemedComponent} from "react-native-theming";
import Icon from "react-native-vector-icons/FontAwesome5";
import FastImage from 'react-native-fast-image';
import {FetchRequest} from "../../util/FetchRequest";
import Orientation from 'react-native-orientation';

const MdSafeAreaView = createThemedComponent(SafeAreaView);
const MdTouchableOpacity = createThemedComponent(TouchableOpacity);
const MdIcon = createThemedComponent(Icon,['color']);

// 取得屏幕的宽高Dimensions
const { width, height } = Dimensions.get('window');
let pageNo = 0;//当前第几页
let itemNum = 16;    //一页显示数量

export default class LiveListPage extends Component{
    constructor(props){
        super(props);
        this.state = {
            listDate:[],

            isLoading: true,
            //网络请求状态
            error: false,
            errorInfo: "",
            showFoot:0, // 控制foot， 0：隐藏footer  1：已加载完成,没有更多数据   2 ：显示加载中
            isRefreshing:false,//下拉控制
            endPage:false, //是否到达最后一页
            isRefresh:false,
        };

        //隐藏底部导航栏
        this.props.navigation.setParams({
            fullscreen: false,
        })
    }

    componentDidMount() {
        this.getData(pageNo);
    }

    componentWillUnmount(){
        pageNo = 0;
        Orientation.lockToPortrait();
    }

    componentWillMount() {
       Orientation.lockToPortrait();
    }

    getData( pageNo ) {
        FetchRequest(
            global.ActiveDomain+'/zhubo',
            'post',
            {
                page:pageNo,
                num:itemNum,
                p_id:this.props.navigation.getParam('Pid')
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
                // this.setState({
                //     error: true,
                //     errorInfo: error
                // })
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
    };

    //下拉刷新
    _onRefresh=()=>{
        // 不处于 下拉刷新
        if(!this.state.isRefresh){
            pageNo = 0;
            this.getData(pageNo);
        }
    };

    //加载等待页
    _renderLoadingView() {
        return (
            <Theme.View style={{alignItems:'center', justifyContent: 'center',backgroundColor:'@BackgroundColor',flex:1}}>
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
            <Theme.View style={{backgroundColor:'@BackgroundColor',flex:1}}>
                <Text>
                    加载失败
                </Text>
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
            // return (
            //     <View style={{height:30,alignItems:'center',justifyContent:'flex-start',}}>
            //         <Text style={{color:'#7D3ED3',fontSize:14,marginTop:5,marginBottom:5,}}>
            //             我也有底线的，撸不动了……
            //         </Text>
            //     </View>
            // );
        } else if(this.state.showFoot === 2) {
            return (
                <View style={{alignItems:'center',justifyContent:'flex-start',}}>
                    <ActivityIndicator
                        animating={true}
                        color='#7D3ED3'
                    />
                    <Text style={{color:'#7D3ED3',fontSize:14,marginTop:5,marginBottom:5,}}>正在加载更多数据...</Text>
                </View>
            );
        } else if(this.state.showFoot === 0){
            return null;
        }
    }


    render() {
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
                    <Icon onPress={()=>this.props.navigation.goBack()} name='chevron-left' style={styles.navBarIcon} />
                    <Text style={styles.navBarText}>{this.props.navigation.getParam('Ptitle')}</Text>
                </Theme.View>
                <Theme.View style={{padding: 10,backgroundColor:'@ThemeColor'}}>
                    <Theme.View style={{backgroundColor:'@BackgroundColor',flexDirection:'row',padding:20,alignItems:'center',borderRadius:5,overflow: 'hidden'}}>
                        <FastImage source={{uri:this.props.navigation.getParam('Pphoto')}} resizeMode={'cover'} style={{width:60,height:60,borderRadius: 5}} />
                        <View style={{marginLeft:20,flex:1}}>
                            <Theme.View style={{flexDirection:'row',paddingBottom:10,borderBottomColor:'@LabelTextColor',borderBottomWidth: 1,alignItems:'flex-end'}}>
                                <Theme.Text style={{color:'@TextColor',fontSize:18}}>{this.props.navigation.getParam('Ptitle')}</Theme.Text>
                                <Theme.Text style={{marginLeft: 10,color:'@LabelTextColor'}}>直播平台</Theme.Text>
                                <Theme.Text style={{marginLeft: 10,backgroundColor:'@ThemeColor',color:'@WriteTextColor',paddingHorizontal:10,borderRadius:5,lineHeight:15,paddingVertical: 0,overflow:'hidden',fontSize:10}}>{this.props.navigation.getParam('Pcount')}人直播</Theme.Text>
                            </Theme.View>
                            <Theme.Text style={{color:'@LabelTextColor',marginTop:10,fontSize:12}}>本平台所有直播及图片内容全部是由服务器从第三方获取内容</Theme.Text>
                        </View>
                    </Theme.View>
                </Theme.View>
                <Theme.View style={{flex:1}}>
                    <FlatList
                        data={this.state.listDate}
                        keyExtractor={(item, index) => item.id.toString()+'-'+index}
                        renderItem={(item)=>
                            <MdTouchableOpacity onPress={()=>this.props.navigation.navigate('LiveDetailPage',{Url:item.item.address,Ptitle:item.item.title,Pphoto:item.item.img,Pnum:Math.floor(Math.random()*1000)})} style={[styles.item_son,{backgroundColor:'@BackgroundColor'}]}>
                                <FastImage defaultSource={require('../../../res/images/logo-white.png')} source={{uri:item.item.img}} resizeMode={'cover'} style={styles.item_img} />
                                <View style={{justifyContent:'space-between',position: 'absolute',top:0,bottom:0,alignItems:'flex-end'}}>
                                    <Theme.View style={[styles.item_text,{backgroundColor:'rgba(0,0,0,0.6)'}]}>
                                        <MdIcon name={'users'} color={'#FFF'} />
                                        <Text style={{marginLeft:5,color:'#FFF'}}>{Math.floor(Math.random()*1000)}</Text>
                                    </Theme.View>
                                    <View style={{width:(width-30)/2,backgroundColor:'rgba(0,0,0,0.6)',height:20}}>
                                        <Theme.Text style={{color:'@WriteTextColor',lineHeight:20,paddingHorizontal: 10}} numberOfLines={1}>{item.item.title}</Theme.Text>
                                    </View>
                                </View>
                            </MdTouchableOpacity>
                        }
                        numColumns={2}
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

const styles = StyleSheet.create({
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

    item_son:{
        width:(width-30)/2,marginTop:10,alignItems:'center',marginLeft:10,borderRadius:5
    },
    item_img:{
        width:(width-30)/2,height:(width-30)/3,borderRadius:5
    },
    item_text:{
        flexDirection:'row',alignItems:'center',paddingHorizontal:10,borderRadius:12,overflow: 'hidden',width:60,margin: 5
    },

})

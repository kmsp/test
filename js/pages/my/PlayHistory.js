import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator, FlatList, Dimensions
} from 'react-native';
import Icon from "react-native-vector-icons/AntDesign";
import FastImage from 'react-native-fast-image';
import Theme,{createThemedComponent} from "react-native-theming";
import {FetchRequest} from "../../util/FetchRequest";

// 取得屏幕的宽高Dimensions
const { width, height } = Dimensions.get('window');
let pageNo = 0;//当前第几页
let itemNum = 8;    //一页显示数量

const MdSafeAreaView = createThemedComponent(SafeAreaView);

export default class PlayHistory extends Component{

    constructor(props){
        super(props);
        this.state = {
            navbar_title:'播放历史',
            listDate:[],    //数据源

            isLoading: true,
            //网络请求状态
            error: false,
            errorInfo: "",
            showFoot:0, // 控制foot， 0：隐藏footer  1：已加载完成,没有更多数据   2 ：显示加载中
            isRefreshing:false,//下拉控制
            endPage:false, //是否到达最后一页
            isRefresh:false,//下拉刷新
        };

        //隐藏底部导航栏
        this.props.navigation.setParams({
            fullscreen: false,
        })
    }

    componentDidMount() {
        if (this.props.page){
            pageNo = 0
        }
        this.getData(pageNo);   //加载数据
    }

    componentWillUnmount(){
        pageNo = 0
    }

    //获取数据
    getData( pageNo ) {
        FetchRequest(
            global.ActiveDomain+"/Find_historys",
            "ENCRYPTO",
            {
                account: global.UniqueId,
                page: pageNo,
                num: itemNum,
            },
            (responseJson) => {
              if(responseJson!="")
              {
                let data = responseJson.data;
                let dataBlob = [];
                if (pageNo === 0){
                    dataBlob = data;
                } else {
                    dataBlob = this.state.listDate.concat(data);
                }

                let foot = 0;
                let endpage = false;
                if(data.length < 1){
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
                data = null;
                dataBlob = null;
              }else{
                this.setState({
                  isLoading: false,
                  showFoot: 0,
                  isRefreshing:false,
                });
              }
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

    _GetDateTimeDiff(time) {
        //计算出小时数
        let leave1 = time % (3600);    //计算天数后剩余的分钟
        let hours = Math.floor(leave1 / (3600));
        //计算相差分钟数
        let second = leave1 % (60);    //计算天数后剩余的秒数
        let minutes = Math.floor(leave1 / (60));

        let strTime = "";
        if (hours >= 1) {
            strTime = hours + "小时" + minutes + "分钟" + second + "秒";
        } else if (minutes >= 1) {
            strTime = minutes + "分钟" + second + "秒";
        } else {
            strTime = second + "秒";
        }
        return strTime;
    }

    //循环组件
    _renderItem = ({item})=>(
        <View style={styles.item_son}>
            <View style={{backgroundColor:'#EEE',height: 34}}><Text style={{lineHeight:34,marginLeft: 10}}>{item.date}</Text></View>
            {item.list.map((value)=>{
                return(
                    <TouchableOpacity key={value.id.toString()} style={styles.item_view} onPress={() => {value.movie.type === 1 ? this.props.navigation.push('AvDetail',{tabId: value.movie.id,playTime:Math.floor(value.time)}) : this.props.navigation.push('MoveDetail',{tabId: value.movie.id,playTime:Math.floor(value.time)})
                    }} {...this.props}>
                        <FastImage style={{width: 120,height:80,backgroundColor:'#EEE'}} source={{uri:((value.movie.img).startsWith('http') ? value.movie.img : global.ActiveDomain + value.movie.img)}} resizeMode={'cover'} />
                        <View style={{marginLeft:10,justifyContent:'space-between',flex:1}}>
                            <Theme.Text style={{fontSize:13,color:'@TextColor'}} numberOfLines={4}>{value.movie.title}</Theme.Text>
                            {value.time ? <Text style={{fontSize:10,color:'#999'}}>你看到了{this._GetDateTimeDiff(Math.floor(value.time))}</Text> : <Text></Text>}
                        </View>
                    </TouchableOpacity>
                )
            })}
        </View>
    );

    _renderFooter(){
        if (this.state.showFoot === 1) {
            return null;
            // return (
            //     <View style={{height:30,alignItems:'center',justifyContent:'flex-start',}}>
            //         <Text style={{color:'#999999',fontSize:14,marginTop:5,marginBottom:5,}}>
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
                    <Text style={{color:'#999999',fontSize:14,marginTop:5,marginBottom:5,}}>正在加载更多数据...</Text>
                </View>
            );
        } else if(this.state.showFoot === 0){
            return null;
        }
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
                <Theme.View style={[styles.navBar,{backgroundColor:'@THeadColor'}]}>
                    <Icon onPress={()=>this.props.navigation.goBack()} name='left' style={styles.navBarIcon} />
                    <Text style={styles.navBarText}>{this.state.navbar_title}</Text>
                </Theme.View>
                <View style={{flex:1}}>
                    <FlatList
                        data={this.state.listDate}
                        keyExtractor={(item,index) => Math.random().toString()+'-'+index}
                        renderItem={this._renderItem}
                        numColumns = {1}
                        initialNumToRender={1}
                        horizontal={false}
                        style={{width:'100%'}}
                        //上拉加载
                        ListFooterComponent={this._renderFooter.bind(this)}
                        onEndReached={this._onEndReached.bind(this)}
                        onEndReachedThreshold={1}
                        //下拉刷新相关
                        onRefresh={() => this._onRefresh()}
                        refreshing={this.state.isRefresh}

                    />
                </View>

            </MdSafeAreaView>
        )
    }

}

const styles=StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    //顶部navBar样式
    navBar: {
        height: 44,
        backgroundColor: '#7D3ED3',
        width:'100%',
        borderBottomColor:'#ccc',
        borderBottomWidth: 1
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
    },

    item_son:{

    },
    item_view:{
        margin: 10,
        flexDirection: 'row',
    }

});

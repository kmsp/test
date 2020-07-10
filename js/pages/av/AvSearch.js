import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    SafeAreaView,
    Text,
    ActivityIndicator,
    TouchableOpacity,
    TextInput,
    FlatList,
    Dimensions
} from 'react-native';
import Icon from "react-native-vector-icons/AntDesign";
import FastImage from 'react-native-fast-image';
import Theme ,{createThemedComponent}from "react-native-theming";
import {FetchRequest} from "../../util/FetchRequest";
import DeviceStorage from "../../util/DeviceStorage";

let pageNo = 0;//当前第几页
let itemNum = 8;    //一页显示数量

const MdTextInput = createThemedComponent(TextInput, ['placeholderTextColor']);
// 取得屏幕的宽高Dimensions
const { width, height } = Dimensions.get('window');

export default class AvSearch extends Component{
    constructor(props){
        super(props);
        this.state={
            Text:'',
            isShow:false,
            listDate:[],    //数据源
            hotKeywords:[], //热搜关键词
            localKeywords:[],   //本地搜索历史

            //网络请求状态
            error: false,
            errorInfo: "",
            showFoot:0, // 控制foot， 0：隐藏footer  1：已加载完成,没有更多数据   2 ：显示加载中
            isRefreshing:false,//下拉控制
            endPage:false, //是否到达最后一页
            isRefresh:false,//下拉刷新
        }

        //隐藏底部导航栏
        this.props.navigation.setParams({
            fullscreen: false,
        })
    }

    componentWillMount(){
        this._getHotKey();
        DeviceStorage.get('SearchKeys').then((result) => {
            if (result !== null && result !== '') {
                this.setState({localKeywords:result})
            }else{
                console.log(result);
            }
        });
    }

    componentWillUnmount(){
]        clearInterval(this.searchTime);
    }

    //获取热门词
    _getHotKey(){
        FetchRequest(
            global.ActiveDomain+'/search_hot',
            'POST',
            {
                num:30
            },
            (result)=>{
                if (result.code === 200){
                    this.setState({hotKeywords:result.data})
                }
            },
            (error)=>{
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


    //获取数据
    getData( pageNo ) {

        if (this.state.localKeywords.indexOf(this.state.Text) !== -1) {
            // 本地历史 已有 搜索内容
            let index = this.state.localKeywords.indexOf(this.state.Text);
            let tempArr = DeviceStorage.arrDelete(this.state.localKeywords, index);
            tempArr.unshift(this.state.Text);
            DeviceStorage.save("SearchKeys", tempArr);
        } else {
            // 本地历史 无 搜索内容
            let tempArr = this.state.localKeywords;
            tempArr.unshift(this.state.Text);
            DeviceStorage.save("SearchKeys", tempArr);
        }
        FetchRequest(
            global.ActiveDomain+"/Movies",
            "ENCRYPTO",
            {
                account: global.UniqueId,
                page: pageNo,
                num: itemNum,
                search: this.state.Text,
                type: "1"
            },
            (responseJson) => {
              if(responseJson!="")
              {
                let data = responseJson.data.list;
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
                    showFoot:foot,
                    isRefreshing:false,
                    endPage:endpage,
                    isShow:true,
                });
                data = null;
                dataBlob = null;
              }else{
                this.setState({
                  isShow: true,
                  showFoot: 0,
                  isRefreshing:false,
                  });
              }
            },
            (error) => {
                console.log(error);
                this.setState({
                    error: true,
                    errorInfo: error
                })
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

    //空白组件
    _emptyItem(){
        return(
            <Theme.View style={{height:30,alignItems:'center',justifyContent:'flex-start',backgroundColor:'@BackgroundColor',marginTop:10}}>
                <Text style={{color:'#7D3ED3',fontSize:14,marginTop:5,marginBottom:5,}}>
                    没有找到数据，尝试其他关键词搜索试试吧
                </Text>
            </Theme.View>
        )
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

    //循环组件
    _renderItem = ({item})=>(
        <View style={styles.item_son}>
        <TouchableOpacity key={item.id.toString()} style={styles.item_view} onPress={() => {
            item.type === 1 ? this.props.navigation.navigate('AvDetail',{tabId: item.id}) : this.props.navigation.navigate('MoveDetail',{tabId: item.id})
        }} {...this.props}>
            <FastImage style={{width: 120,height:80,backgroundColor:'#EEE',borderRadius:5}} source={{uri:((item.img).startsWith('http') ? item.img : global.ActiveDomain + item.img)}} resizeMode={'cover'} />
            <View style={{marginLeft:10,justifyContent:'space-between',flex:1}}>
                <Text style={{fontSize:13,color:'#333'}}>{item.title}</Text>
                <Text style={{fontSize:10,color:'#999'}}><Text style={{color:'red'}}>{item.zan_lv}%</Text>的撸友认为该片值得一撸</Text>
            </View>
        </TouchableOpacity>
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
        if (this.state.error) {
            //请求失败view
            return this._renderErrorView();
        }

        return(
            <SafeAreaView style={{flex:1}} forceInset={{ bottom: 'never' }}>
            <Theme.View style={[styles.navBar,{backgroundColor:'@HeadColor'}]}>
                    <Icon onPress={()=>this.props.navigation.goBack()} name='left' style={styles.navBarIcon}/>
                    <Text style={styles.navBarText}>AV搜索</Text>
                </Theme.View>
            <Theme.View style={{flex:1,backgroundColor: '@BackgroundColor'}}>
                <View style={{height:40,paddingLeft: 10,flexDirection: 'row'}}>
                    <TextInput
                            onChangeText={(text) => this.setState({Text:text})}
                            placeholder={'搜索您的关键词'}
                            placeholderTextColor={'#999'}
                            style={{borderRadius:20,fontSize:16,lineHeight:40,borderWidth:1,borderColor:'#eee',height: 40,padding: 0,paddingHorizontal: 20,width: width-80,marginTop:10}}
                        />
                    <TouchableOpacity onPress={()=>this.getData(0)} activeOpacity={0.5} style={styles.searchBox}>
                        <Text style={{color:'#000',fontSize:16,lineHeight:40,textAlign:'center'}}>搜索</Text>
                    </TouchableOpacity>
                </View>
                <View style={{flex:1,marginTop:20}}>
                    {
                        this.state.isShow ?
                            <FlatList
                                data={this.state.listDate}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={this._renderItem}
                                ListEmptyComponent={this._emptyItem}
                                numColumns={1}
                                initialNumToRender={3}
                                horizontal={false}
                                style={{width: '100%'}}
                                //上拉加载
                                ListFooterComponent={this._renderFooter.bind(this)}
                                onEndReached={this._onEndReached.bind(this)}
                                onEndReachedThreshold={1}
                                //下拉刷新相关
                                onRefresh={() => this._onRefresh()}
                                refreshing={this.state.isRefresh}

                            />
                            :
                            <View style={{flex: 1,marginTop: 10}}>
                                <View style={{alignItems: 'center'}}>
                                <Theme.Text style={{
                                    fontSize: 12,
                                    color: '@TextColor',
                                    marginTop: 10
                                }}>可以搜索：番号，视频名字，女优名字等</Theme.Text>
                                 {/*<Theme.Text style={{fontSize: 12, color: '@ThemeColor', marginTop: 10}}>点击搜索图标进行搜索</Theme.Text>*/}
                                </View>
                                <View style={{paddingHorizontal: 10}}>
                                    <Theme.Text style={{color:'@SearchBoxColor'}}>热门搜索：</Theme.Text>
                                    <View style={{flexDirection:'row',flexWrap: 'wrap'}}>
                                        {
                                            this.state.hotKeywords.map((value, key) =>
                                                <Theme.Text
                                                    style={[styles.labelText,{color: '@ThemeColor', borderColor: '@ThemeColor',}]}
                                                    key={key}
                                                    onPress={()=>{
                                                        this.setState({Text:value.words});
                                                        this.searchTime = setTimeout(()=>{
                                                            this.getData(0);
                                                        },500);
                                                    }}
                                                >{value.words}</Theme.Text>
                                            )
                                        }

                                    </View>
                                </View>
                                <View style={{paddingHorizontal: 10,marginTop:10}}>
                                    <Theme.Text style={{color:'@SearchBoxColor'}}>历史搜索：</Theme.Text>
                                    <View style={{flexDirection:'row',flexWrap: 'wrap'}}>
                                        {
                                            this.state.localKeywords.map((value, key) =>
                                                <Theme.Text
                                                    style={[styles.labelText,{color: '@ThemeColor', borderColor: '@ThemeColor',}]}
                                                    key={key}
                                                    onPress={()=>{
                                                        this.setState({Text:value});
                                                        this.searchTime = setTimeout(()=>{
                                                            this.getData(0);
                                                        },500);
                                                    }}
                                                >{value}</Theme.Text>
                                            )
                                        }
                                    </View>
                                </View>
                            </View>
                    }
                </View>
            </Theme.View>
            </SafeAreaView>
            )
    }
}

const styles = StyleSheet.create({
    searchBox: {
        borderLeftColor:'#aaa',
        alignItems:'center',
        justifyContent: 'center',
        position:'absolute',
        right:0,
        top:0,
        width:60,
        height:40,
        marginTop:10
    },
    item_son: {
        marginTop:10
    },
    searchImg:{
        width:25,
        height:25,
        // margin: 10,
        marginTop:15
    },
    item_view:{
        margin: 10,
        flexDirection: 'row',
        marginTop:10
    },
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
    labelText:{
        paddingVertical:2,
        paddingHorizontal:10,
        fontSize:12,
        lineHeight:16,
        borderRadius:10,
        borderWidth: 1,
        margin:5
    },
});

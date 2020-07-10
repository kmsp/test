import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Picker,
    SafeAreaView,
    Dimensions,
    FlatList,
    Text,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import Icon from "react-native-vector-icons/AntDesign";
import moment from 'moment';
import Theme, {createThemedComponent} from "react-native-theming";
import {FetchRequest} from "../../util/FetchRequest";

const { width, height } = Dimensions.get('window');

let pageNo = 0;//当前第几页
let itemNum = 10;    //一页显示数量

const MdSafeAreaView = createThemedComponent(SafeAreaView);

export default class ShouYiPage extends Component{
    constructor(props){
        super(props);

        this.state={
            listDate:[],    //列表数据源

            isLoading: true,
            //网络请求状态
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

    }

    componentDidMount(){
        this._getListDate();
    }

    componentWillUnmount(){
        pageNo=0;   //重置数据
    }

    _getListDate(){
        FetchRequest(
            global.ActiveDomain+'/detailed',
            'post',
            {
                account:global.UniqueId,
                num:itemNum,     //每页数量
                page:pageNo,    //分页
            },
            (result)=>{
                if (result.code === 200){
                    let data = result.data;
                    let dataBlob = [];
                    if (pageNo === 0){
                        dataBlob = data;
                    } else {
                        dataBlob = this.state.listDate.concat(data);
                    }

                    let foot = 0;
                    let endpage = false;
                    if(data.length < itemNum){
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
                } else {
                  this.setState({
                    isLoading: false,
                    showFoot: 0,
                    isRefreshing:false,
                  });
                }
            },
            (error)=>{
                // alert('数据获取异常，请检查网络，code'+error);
                Alert.alert(
                    '温馨提示',
                    '数据获取异常，请检查网络，code'+error,
                    [
                        {text: '确定'},
                    ],
                    { cancelable: false }
                );
            }
        )
    }

    //下拉刷新
    _onRefresh=()=>{
        // 不处于 下拉刷新
        if(!this.state.isRefresh){
            pageNo = 0;
            this._getListDate(pageNo);
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
        if((pageNo!==0) && (this.state.endPage)){
            return;
        } else {
            pageNo++;
        }
        //底部显示正在加载更多数据
        this.setState({showFoot:2});
        //获取数据
        this._getListDate( pageNo );
    }


    _renderFooter(){
        if (this.state.showFoot === 1) {
            return (
                <View style={{height:30,alignItems:'center',justifyContent:'flex-start',}}>
                    <Text style={{color:'#999999',fontSize:14,marginTop:5,marginBottom:5,}}>
                        已经全部加载完了。。。
                    </Text>
                </View>
            );
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
                <Theme.View style={[styles.navBar,{backgroundColor:'@HeadColor'}]}>
                    <Icon onPress={()=>this.props.navigation.goBack()} name='left' style={styles.navBarIcon} />
                    <Text style={styles.navBarText}>收益明细</Text>
                </Theme.View>
                <View style={{flexDirection: 'row',paddingHorizontal:10,borderBottomColor:'#eee',borderBottomWidth: 1}}>
                    <Theme.Text style={{flex:1,lineHeight:40,color:'@TextColor'}}>明细</Theme.Text>
                    <Theme.Text style={{width:40,textAlign: 'center',lineHeight:40,color:'@TextColor'}}>金额</Theme.Text>
                    <Theme.Text style={{width:100,lineHeight:40,textAlign:'center',color:'@TextColor'}}>日期</Theme.Text>
                </View>
                <FlatList
                    data={this.state.listDate}
                    keyExtractor={(item, index) => item.id.toString()+'-'+index}
                    renderItem={(item)=>
                        <View style={{flexDirection: 'row',paddingHorizontal:10,borderBottomColor:'#eee',borderBottomWidth: 1}}>
                            <Theme.Text style={{flex:1,lineHeight:40,color:'@TextColor'}}>{item.item.des}</Theme.Text>
                            <Theme.Text style={{width:40,textAlign: 'center',lineHeight:40,color:'@TextColor'}}>{item.item.money}</Theme.Text>
                            <Theme.Text style={{width:100,lineHeight:40,textAlign:'right',color:'@TextColor'}}>{moment(item.item.c_time*1000).format("YYYY-MM-DD")}</Theme.Text>
                        </View>
                    }
                    initialNumToRender={1}
                    horizontal={false}
                    style={{width:'100%'}}
                    //上拉加载
                    ListFooterComponent={this._renderFooter.bind(this)}
                    onEndReached={this._onEndReached.bind(this)}
                    onEndReachedThreshold={0.1}
                    //下拉刷新相关
                    onRefresh={() => this._onRefresh()}
                    refreshing={this.state.isRefresh}
                />

            </MdSafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    //顶部navBar样式
    navBar: {
        height: 44,
        backgroundColor: '#7D3ED3',
        width: '100%',
        borderBottomColor:'#ccc',
        borderBottomWidth: 1,
    },
    navBarIcon: {
        fontSize: 25,
        position: 'absolute',
        left: 0,
        top: 0,
        marginLeft: 15,
        color: '#000',
        lineHeight: 44
    },
    navBarText: {
        color: '#000',
        textAlign: 'center',
        alignSelf: 'center',
        lineHeight: 44,
        fontSize: 18
    },
})

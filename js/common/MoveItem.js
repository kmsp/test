import React, {Component} from  'React';
import {
    ActivityIndicator, Dimensions,
    FlatList,
    StyleSheet,
    Text,
    View
} from "react-native";
import MoveItemSon from "./MoveItemSon";
import Theme from "react-native-theming";
import {FetchRequest} from "../util/FetchRequest";


// 取得屏幕的宽高Dimensions
const { width, height } = Dimensions.get('window');
let pageNo = 0;//当前第几页
let itemNum = 8;    //一页显示数量
let url = '';  //区分 搜藏和普通接口

export default class MoveItem extends Component{

    constructor(props) {
        super(props);
        this.state = {
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
    }

    componentWillMount(){
        if (this.props.page){
            pageNo = 0
        }
        //加载数据
        this.getData(pageNo)
    }

    componentDidMount() {

    }

    componentWillUnmount(){
        this.setState({
            listDate:[],    //数据源
        })
        pageNo = 0
    }

    //获取数据
    getData( pageNo ) {
        let body = {};
        if (this.props.isLike === 1){
            url = global.ActiveDomain+"/Favorite_movie_list";
            body = {
              account: global.UniqueId,
              type: this.props.typeId,
              page: pageNo,
              num: itemNum,
            }
        }else{
            if (this.props.movieId){
                url = global.ActiveDomain+"/Movie_relateds";
                body ={
                  account: global.UniqueId,
                  page: pageNo,
                  num: itemNum,
                  m_id: this.props.movieId,
                }
            }else{
                url = global.ActiveDomain+"/Movies";
                body = {
                  account: global.UniqueId,
                  type: this.props.typeId,
                  page: pageNo,
                  num: itemNum,
                  nav: this.props.navId,
                  cate: this.props.cateId,
                  a_id: this.props.actorId,
                  label: this.props.labelId,
                  state: this.props.stateId,
                }
            }
        }
        return FetchRequest(
                url,
                'ENCRYPTO',
                body,
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
                  }else{
                    this.setState({
                      isLoading: false,
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
        this.getData( pageNo );
    }

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


    render() {
        //第一次加载等待的view
        if (this.state.isLoading && !this.state.error) {
            return this._renderLoadingView();
        } else if (this.state.error) {
            //请求失败view
            return this._renderErrorView();
        }

        return (
            <Theme.View style={[styles.container,{backgroundColor:'@BackgroundColor',flex:1}]}>
                <FlatList
                    data={this.state.listDate}
                    keyExtractor={(item,index) => item.id.toString()+'-'+index}
                    renderItem={(item)=><MoveItemSon item={item.item} is_like={item.item.like} {...this.props}/>}
                    numColumns = {2}
                    initialNumToRender={1}
                    horizontal={false}
                    style={{width:'100%'}}
                    //上拉加载
                    ListFooterComponent={this._renderFooter.bind(this)}
                    onEndReached={this._onEndReached.bind(this)}
                    onEndReachedThreshold={0.01}
                    //下拉刷新相关
                    onRefresh={() => this._onRefresh()}
                    refreshing={this.state.isRefresh}

                />
            </Theme.View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
});

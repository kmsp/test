import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    Alert,
    Linking,
    View,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Image,
    ActivityIndicator
} from 'react-native';
import Icon from "react-native-vector-icons/AntDesign";
import Carousel, { Pagination } from 'react-native-snap-carousel';
import {FetchRequest} from "../../util/FetchRequest";
import FastImage from 'react-native-fast-image';
import JingXuanItemSon from "./JingXuanItemSon";
import Theme, {createThemedComponent} from "react-native-theming";

const {width, height} = Dimensions.get('window');
const SWIPER_HEIGHT = (width-8)*0.4877;

const MdTouchableOpacity = createThemedComponent(TouchableOpacity);
const MdIcon = createThemedComponent(Icon);

export default class JingXuanPage extends Component{

    constructor(props){
        super(props);
        this.state= {
            SwiperListDate: [],  //顶部轮播图
            AdDate: [],
            AvListDate:[],  //最新电影
            MoveListDate:[],    //最新视频
            HotAvListDate:[],  //最热电影
            HotMoveListDate:[],    //最热视频
        }
    }

    componentWillMount() {
        this._getSwiperDate();
        this._getNewMovie();
        this._getNewAV();
        this._getHotNewAV();
        this._getHotNewMovie();

    }

    componentDidMount() {

    }

    //轮播图
    _getSwiperDate(){
        FetchRequest(
            global.ActiveDomain+"/movie",
            'POST',
            {account:global.UniqueId,jing:1,num:6},
            (result)=>{
                if (result.code === 200){
                    console.log('AdDate', result.data.ad[0])
                    this.setState({
                        SwiperListDate:result.data.list,
                        AdDate:result.data.ad[0],
                    });
                } else {

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
                );
            }
        )
    }

    //最新电影
    _getNewAV(){
        FetchRequest(
            global.ActiveDomain+'/movie',
            'POST',
            {
                type:1,
                account:global.UniqueId,
                state:1,
                num:4
            },
            (result)=>{
                if (result.code === 200){
                    this.setState({AvListDate:result.data.list});
                } else {

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
                );
            }
        )
    }

    //最热电影
    _getHotNewAV(){
        FetchRequest(
            global.ActiveDomain+'/movie',
            'POST',
            {
                type:1,
                account:global.UniqueId,
                state:2,
                num:6
            },
            (result)=>{
                if (result.code === 200){
                    this.setState({HotAvListDate:result.data.list});
                } else {

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
                );
            }
        )
    }

    //最新视频
    _getNewMovie(){
        FetchRequest(
            global.ActiveDomain+'/movie',
            'POST',
            {
                type:2,
                account:global.UniqueId,
                state:1,
                num:4
            },
            (result)=>{
                if (result.code === 200){
                    this.setState({MoveListDate:result.data.list});
                } else {

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
                );
            }
        )
    }

    //最热视频
    _getHotNewMovie(){
        FetchRequest(
            global.ActiveDomain+'/movie',
            'POST',
            {
                type:2,
                account:global.UniqueId,
                state:2,
                num:6
            },
            (result)=>{
                if (result.code === 200){
                    this.setState({HotMoveListDate:result.data.list});
                } else {

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
                );
            }
        )
    }

    //点击广告
    _clickAd(item){
        FetchRequest(
            global.ActiveDomain+"/Advertising_records",
            "ENCRYPTO",
            {
                a_id: item.id,
                account: global.UniqueId,
            },
            (responseJson) => {
                if (responseJson.code === 200){
                    Linking.openURL(item.url)
                }else{
                    Alert.alert(
                        '温馨提示',
                        '请重试点击广告',
                        [
                            {text: '返回'},
                        ],
                        { cancelable: false }
                    )
                }
            },
            (error) => {
                Alert.alert(
                    '温馨提示',
                    '请重试点击广告',
                    [
                        {text: '返回'},
                    ],
                    { cancelable: false }
                )
                console.error(error);
            }
        )

    };

        //下拉刷新
/*    _onRefresh=()=>{
        // 不处于 下拉刷新
        if(!this.state.isRefresh){
            pageNo = 0;
            this._getSwiperDate();
            this._getHotNewAV();
            this._getHotNewMovie();
        }
    };
    */

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
        if(this.state.showFoot != 0 ){
            return ;
        }
        //如果当前页大于或等于总页数，那就是到最后一页了，返回
        if((pageNo!=0) && (this.state.endPage)){
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
            return (
                <View style={styles.footer}>
                    <Text></Text>
                </View>
            );
        }
    }

    _renderItem ({item, index}) {
        let that = this;
        return (
          <TouchableOpacity onPress={() => {
              item.type === 1 ?
                  that.props.navigation.navigate('AvDetail',{tabId: item.id})
                  :
                  that.props.navigation.navigate('MoveDetail',{tabId: item.id})
          }} key={index} activeOpacity={0.} title={<Text numberOfLines={1} style={{lineHeight:24,fontSize:12,color:'#fff'}}></Text>}>
              <FastImage style={{height:SWIPER_HEIGHT,width:width-8,borderRadius:8}} source={{uri:(item.img.startsWith('http') ? item.img : global.ActiveDomain+item.img)}} resizeMode={'cover'} />
          </TouchableOpacity>
        );
    }


    get pagination () {
        const { SwiperListDate, activeSlide } = this.state;
        return (
            <Pagination
              dotsLength={this.state.SwiperListDate.length}
              activeDotIndex={activeSlide}
              containerStyle={{ backgroundColor: 'rgba(0, 0, 0, 0)'}}
              dotStyle={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  marginHorizontal: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.75)'
              }}
              inactiveDotStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.75)'
                  // Define styles for inactive dots here
              }}
              inactiveDotOpacity={0.4}
              inactiveDotScale={0.6}
            />
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
            <Theme.View style={[styles.container,{backgroundColor:'@BackgroundColor',flex:1}]}>
                <View style={{flexDirection: 'row',paddingHorizontal: 10,alignItems: 'center'}}>
                    <TouchableOpacity activeOpacity={1} onPress={()=>this._clickAd(this.state.AdDate)}>
                        <FastImage source={{uri:this.state.AdDate.img}} resizeMode={'cover'} style={{width:width-20,height:(width-20)/5.03125,borderRadius:5,marginTop:10,marginLeft:0}} />
                    </TouchableOpacity>
                </View>
                <ScrollView style={{flex:1,marginTop:10}}>
                    <View style={{width:width,height:SWIPER_HEIGHT,flexDirection: 'row',paddingHorizontal: 3,alignItems: 'center'}}>



                        <Carousel
                          ref={(c) => { this._carousel = c; }}
                          data={this.state.SwiperListDate}
                          renderItem={this._renderItem.bind(this)}
                          sliderWidth={width}
                          itemWidth={width-8}
                          autoplay={true}
                          loop={true}
                          onSnapToItem={(index) => this.setState({ activeSlide: index })}
                          layout={'stack'}
                          layoutCardOffset={`18`}
                        />
                          <TouchableOpacity style={{position:'absolute',bottom:0,right:20,width: 15, height: 10, justifyContent: 'center', alignItems: 'center', margin: 5}} onPress={()=>{console.log('touched');}}  >
                            { this.pagination }
                          </TouchableOpacity>

                    </View>

                   <View style={{flexDirection:'row',paddingHorizontal:10}}>
                        <Theme.View style={{width:5,height:18,marginVertical: 6,backgroundColor:'@TabTextColor'}} />
                        <Theme.Text style={{color:'@TextColor',flex:1,fontSize:16,lineHeight:30,fontWeight: 'bold',marginLeft: 5}}>热门AV</Theme.Text>
                        <Text  onPress={() => this.props.navigation.navigate('NewAvList',{Title:'热门AV',TabId:1})} style={{color:'#999',fontSize:12,textAlign: 'right',lineHeight:30}}>更多</Text>
                    </View>
                    <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                        {
                            this.state.HotAvListDate.map((value, index) =>
                                <JingXuanItemSon key={value.id+'-1'+index} item={value} is_like={value.like} {...this.props} />
                            )
                        }
                    </View>
                    <Theme.View style={{height:8,backgroundColor:'@JiangeColor'}} />

                    <View style={{flexDirection:'row',paddingHorizontal:10}}>
                        <Theme.View style={{width:5,height:18,marginVertical: 6,backgroundColor:'@TabTextColor'}} />
                        <Theme.Text style={{color:'@TextColor',flex:1,fontSize:16,lineHeight:30,fontWeight: 'bold',marginLeft: 5}}>热门短片</Theme.Text>
                        <Text  onPress={() => this.props.navigation.navigate('NewMovieList',{Title:'热门短片',TabId:2})} style={{color:'#999',fontSize:12,textAlign: 'right',lineHeight:30}}>更多</Text>
                    </View>
                    <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                        {
                            this.state.HotMoveListDate.map((value, index) =>
                                <JingXuanItemSon key={value.id+'-3'+index} item={value} is_like={value.like} {...this.props} />
                            )
                        }
                    </View>
                </ScrollView>
            </Theme.View>
        )
    }


}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },

    itemson:{
        width: (width-30)/2,
        height: ((width-30)/2)*0.667 + 32,
        paddingBottom: 0,
        marginTop:10,
        marginLeft: 10,
        position: 'relative'
    },
    outermost:{
        flex:1,
        flexDirection:'column',
        position:'absolute',
        top:0,
        height:((width-30)/2)*0.667,
        width:(width-30)/2
    },
    top:{
        flex:1,
        alignItems:'flex-end'
    },
    collect:{
        width:30,
        height:30,
        marginRight: 5,
        marginTop:5,
    },
    bottom:{
        backgroundColor:'#000',
        opacity:0.7,
        height:20,
        flexDirection: 'row',
    },
    bottomleft:{
        flex:1,
        flexDirection: 'row',
    },
    bottomright:{
        flex:1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginRight: 4,
    },
    font:{
        fontSize:10,
        color:'#fff',
        lineHeight:20,
    },
    bottomimg:{
        height:12,
        width:12,
        margin:4,
    },
});

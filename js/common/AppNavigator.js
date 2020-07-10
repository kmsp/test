/**
 * 全局底部导航
 */
import React, {Component} from 'react';
import { StyleSheet, Image } from 'react-native';
import { createBottomTabNavigator, createStackNavigator, createAppContainer } from 'react-navigation';
import Orientation from 'react-native-orientation';
import AvPage from "../pages/AvPage";
import MovePage from "../pages/MovePage";
import ClassPage from "../pages/ClassPage";
import CollectionPage from "../pages/CollectionPage";
import MyPage from "../pages/MyPage";
import AvDetail from "../pages/av/AvDetail";
import MoveDetail from "../pages/move/MoveDetail";
import NvyouDetail from "../pages/av/NvyouDetail";
import NvyouList from "../pages/class/NvyouList";
import AvClass from "../pages/class/AvClass";
import MoveClass from "../pages/class/MoveClass";
import AvClassDetail from "../pages/class/AvClassDetail";
import MoveClassDetail from "../pages/class/MoveClassDetail";
import TagDetail from "../pages/class/TagDetail";
import SharePage from "../pages/my/SharePage";
import Lock from "../pages/my/Lock";
import PlayHistory from  "../pages/my/PlayHistory";
import Acount from  "../pages/my/Acount";
import AvSearch from "../pages/av/AvSearch";
import MoveSearch from "../pages/move/MoveSearch";
import ScanCode from "../pages/my/ScanCode";
import VipCode from "../pages/my/VipCode";
import VipShowPage from "../pages/my/VipShowPage";
import TixianPage from "../pages/my/TixianPage";
import ShouYiPage from "../pages/my/ShouYiPage";
import TixianJiluPage from "../pages/my/TixianJiluPage";
import ShareCodePage from "../pages/my/ShareCodePage";
import NewAvList from "../pages/av/NewAvList";
import NewMovieList from "../pages/av/NewMovieList";
import VipPayPage from "../pages/my/VipPayPage";
import SafeCodePage from "../pages/my/SafeCodePage";
import RestSafeCodePage from "../pages/my/RestSafeCodePage";
import FindAccountPage from "../pages/my/FindAccountPage";
import ChangeSafeCodePage from "../pages/my/ChangeSafeCodePage";
import BingPhonePage from "../pages/my/BingPhonePage";
import LivePage from "../pages/LivePage";
import LiveDetailPage from "../pages/live/LiveDetailPage";
import LiveListPage from "../pages/live/LiveListPage";
import DownloadPage from "../pages/my/DownloadPage";
import LocalVideo from "../pages/my/LocalVideo";
import Kefu from "../pages/my/Kefu";
import ProxyPage from "../pages/my/ProxyPage"
import NoNetwork from "./NoNetwork"

    const AvScreen = createStackNavigator(
        {
            AvPage: AvPage,
            AvSearch:AvSearch,          //电影搜索页
            AvDetail: AvDetail,         //视频详情页
            MoveDetail:MoveDetail,      //视频详情页
            NvyouDetail: NvyouDetail,   //演员详情页
            TagDetail:TagDetail,        //标签 详情页
            SharePage:SharePage,        //分享页面
            CollectionPage:CollectionPage,  //收藏界面
            NewAvList:NewAvList,            //电影最新列表
            NewMovieList:NewMovieList,      //视频最新列表
            VipShowPage:VipShowPage,        //VIP购买页
        },
        {
            headerMode:'none',
        },
    )

    AvScreen.navigationOptions  = () => {
        return {
            tabBarLabel: 'AV',
            tabBarIcon: ({ tintColor,focused }) => {
                return(
                    focused ?
                        <Image source={require('../../res/images/tabIconsActive/av.png')} style={styles.icon} />
                        :
                        <Image source={require('../../res/images/tabIcons/av.png')} style={styles.icon} />
                )
            },
        }
    }

    const MoveScreen = createStackNavigator(
        {
            MovePage: MovePage,
            MoveSearch:MoveSearch,      //视频搜索页
            MoveDetail:MoveDetail,      //视频详情页
            TagDetail:TagDetail,        //标签 详情页
            SharePage:SharePage,        //分享页面
            VipShowPage:VipShowPage,        //VIP购买页
        },
        {
            headerMode:'none',
        }
    )

    MoveScreen.navigationOptions  = () => {
        return {
            tabBarLabel: '短片',
            tabBarIcon: ({ tintColor,focused }) => {
                return(
                    focused ?
                        <Image source={require('../../res/images/tabIconsActive/video.png')} style={styles.icon} />
                        :
                        <Image source={require('../../res/images/tabIcons/video.png')} style={styles.icon} />
                )
            },
        }
    }

    const RouteTab =  createBottomTabNavigator(
        {
            Av: AvScreen,
            Move: MoveScreen,
            Class:createStackNavigator(
                {
                    ClassPage: ClassPage,
                    NvyouList:NvyouList,    //演员列表
                    AvClass:AvClass,        //电影分类
                    MoveClass:MoveClass,    //视频分类
                    NvyouDetail: NvyouDetail,   //演员详情页
                    AvClassDetail:AvClassDetail,    //电影分类 详情页
                    MoveClassDetail:MoveClassDetail,    //视频分类 详情页
                    TagDetail:TagDetail,        //标签 详情页
                    AvDetail: AvDetail,     //电影详情页
                    MoveDetail:MoveDetail,  //视频详情页
                },
                {
                    headerMode:'none',
                    tabBarVisible: false,
                    navigationOptions: {
                        tabBarLabel: '分类',
                        tabBarIcon: ({ tintColor,focused }) => {
                            return(
                                focused ?
                                    <Image source={require('../../res/images/tabIconsActive/category.png')} style={styles.icon} />
                                    :
                                    <Image source={require('../../res/images/tabIcons/category.png')} style={styles.icon} />
                            )
                        },
                    }
                }
            ),
            Live:createStackNavigator(
                {
                    LivePage: LivePage,
                    LiveListPage:LiveListPage,      //平台主播列表页
                    LiveDetailPage:LiveDetailPage,  //直播详情页
                    VipShowPage:VipShowPage,         //Vip充值界面
                },
                {
                    headerMode:'none',
                    tabBarVisible: false,
                    navigationOptions: {
                        tabBarLabel: '直播',
                        tabBarIcon: ({ tintColor,focused }) => {
                            return(
                                focused ?
                                    <Image source={require('../../res/images/tabIconsActive/live.png')} style={styles.icon} />
                                    :
                                    <Image source={require('../../res/images/tabIcons/live.png')} style={styles.icon} />
                            )
                        },
                    }
                }
            ),
            My:createStackNavigator(
                {
                    MyPage: MyPage,
                    SharePage:SharePage,    //分享界面
                    ShareCodePage:ShareCodePage,    //分享二级页面
                    Lock:Lock,              //密码锁
                    PlayHistory:PlayHistory,    //历史播放
                    Acount:Acount,    //账户信息
                    AvDetail:AvDetail,      //电影详情页
                    MoveDetail:MoveDetail,  //视频详情页
                    ScanCode:ScanCode,      //扫描二维码
                    VipCode:VipCode,        //兑换码
                    VipShowPage:VipShowPage,    //购买会员
                    VipPayPage:VipPayPage,      //购买会员支付码
                    TixianPage:TixianPage,      //提现页面
                    CollectionPage:CollectionPage,  //收藏界面
                    ShouYiPage:ShouYiPage,      //收益明细
                    TixianJiluPage:TixianJiluPage,  //提现记录
                    SafeCodePage:SafeCodePage,     //安全码
                    RestSafeCodePage:RestSafeCodePage,  //重置安全码
                    FindAccountPage:FindAccountPage,    //找回账号
                    ChangeSafeCodePage:ChangeSafeCodePage,  //修改安全码
                    BingPhonePage:BingPhonePage,            //绑定手机
                    DownloadPage:DownloadPage,              //缓存记录
                    LocalVideo:LocalVideo,                  //缓存播放器
                    Kefu:Kefu,                      //在线客服
                    ProxyPage:ProxyPage,            //代理详情
                },
                {
                    headerMode:'none',
                    tabBarVisible: false,
                    navigationOptions: {
                        tabBarLabel: '我的',
                        tabBarIcon: ({ tintColor,focused }) => {
                            return(
                                focused ?
                                    <Image source={require('../../res/images/tabIconsActive/my.png')} style={styles.icon} />
                                    :
                                    <Image source={require('../../res/images/tabIcons/my.png')} style={styles.icon} />
                            )
                        },
                    },
                }
            )
        },
        {
            defaultNavigationOptions: ({ navigation,screenProps}) => {
                let temp = navigation.state.routes[navigation.state.index];
                const tabBarVisible = temp.params ? temp.params.fullscreen : true;
                return{
                    tabBarVisible,
                    header: null,
                    animationEnabled: true, // 切换页面时是否有动画效果
                    tabBarPosition: 'bottom', // 显示在底端，android 默认是显示在页面顶端的
                    swipeEnabled: false, // 是否可以左右滑动切换tab
                    // lazy: true,//是否根据需要懒惰呈现标签，而不是提前
                    // backBehavior: 'none', // 按 back 键是否跳转到第一个Tab(首页)， none 为不跳转
                    tabBarOptions: {
                        showIcon: true, //安卓环境下显示图标
                        showLabel: true,//是否展示文字
                        activeTintColor: screenProps.ThemeColor, // 文字和图片选中颜色
                        inactiveTintColor: '#AAA', // 文字和图片未选中颜色
                        style: {
                            backgroundColor: screenProps.BackgroundColor, // TabBar 背景色
                            height: Orientation.getInitialOrientation() === 'PORTRAIT' ? 44 : 0,
                            borderTopColor: '#ccc',
                            borderTopWidth: 1,
                            padding: 2,
                            opacity: Orientation.getInitialOrientation() === 'PORTRAIT' ? 1 : 0,
                        },
                        labelStyle: {
                            // fontSize: 14, // 文字大小
                        },
                    },
                }
            }
        });



export default createAppContainer(RouteTab);

const styles = StyleSheet.create({
    icon:{
        height:18,
        width:18,
    },
});

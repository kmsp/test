/**
 * Av界面
 */
import React, {Component} from 'react';
import {StyleSheet, View, SafeAreaView, Dimensions, Text, Modal, TouchableOpacity, Image, Platform, Alert, Linking, Clipboard} from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import TabBar from "react-native-underline-tabbar";
import AvList from './av/AvList';
import AvHot from './av/AvHot';
import JingXuanPage from './av/JingXuanPage';
import {createThemedComponent} from "react-native-theming";
import ViewShot, { captureScreen, captureRef } from "react-native-view-shot";
import { queryRemind, writeRemind} from '../util/DButils'
import NetInfo from "@react-native-community/netinfo";
import {FetchRequest} from "../util/FetchRequest";


const { width, height } = Dimensions.get('window');
const nav_width = 60;

const MdSafeAreaView = createThemedComponent(SafeAreaView);
const MdScrollableTabView = createThemedComponent(ScrollableTabView,['tabBarActiveTextColor','tabBarInactiveTextColor']);
const MdTabBar = createThemedComponent(TabBar,['underlineColor']);
const Button = createThemedComponent(TouchableOpacity);

export default class AvPage extends Component{
    constructor(props) {
        super(props);
        this.state = {
            tabShow: false,
            NavDate: [],
            ZsData:[],
            pingzheng: false,
            account: global.UniqueId,
        };
    }

    componentDidMount() {
      NetInfo.getConnectionInfo().then((connectionInfo) => {
        console.log('Initial, type: ' + connectionInfo.type + ', effectiveType: ' + connectionInfo.effectiveType);
        if(connectionInfo.type =="none"){
          this.props.navigation.navigate('Download')
        }

      });
        this._getNavDate();
        this._getZsData();

    }

    componentWillMount() {
    }

    componentWillUnmount() {
    }



    _getNavDate(){
        fetch(global.ActiveDomain+"/nav/1")
            .then(response => response.json())
            .then(responseJson => {
                this.setState({
                    NavDate:responseJson.data,
                    tabShow: true
                });
            })
            .catch(error => {
                console.error(error);
                Alert.alert(
                        '温馨提示',
                        '数据获取异常，请检查网络，code'+error,
                        [
                            {text: '返回'},
                        ],
                        { cancelable: false }
                    )
            });
    }

    //证书配置
    _getZsData() {
        return FetchRequest(
            global.ActiveDomain+"/Certificate",
            "ENCRYPTO",
            {},
            (responseJson) => {
                this.setState({
                    ZsData:responseJson.data[0],
                });
                this.zhengshu();
                Clipboard.setString(responseJson.data[0].copy);
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

    //保存凭证
    async Pingzheng(){
      this.setState({
        pingzheng: true,
      })

    };

    savePingZheng(){
      let that = this;
      that.setState({
        pingzheng: false,
      })
      //this.props.navigation.navigate('Acount')

    }


    //证书提示
    async zhengshu(){
        let remind = await queryRemind();
        let isSwitch = false;
        let now = new Date().getDate();
        if(remind.length == 0){
          let remind_data = {}
          await this.Pingzheng();
          remind_data.id = 1;
          remind_data.lastRemindDate = now-1;
          writeRemind(remind_data);
        }else if(remind[0].lastRemindDate != now){
          let remind_data = {}
          remind_data.id = remind[0].id+1;
          remind_data.lastRemindDate = now;
          writeRemind(remind_data);
          isSwitch = true;
        }
        if(isSwitch){
            if(Platform.OS==='android'){
            }else{
                Alert.alert(
                    this.state.ZsData.title,
                    this.state.ZsData.txt,
                    [
                        {text: '取消'},
                        {text: '立即安装', onPress: () => Linking.openURL(this.state.ZsData.url)},
                    ],
                    { cancelable: false }
                )
            }

        }
    }

    // 滑动tab
    renderScrollableTab() {
        let NavDate = this.state.NavDate;
        if (this.state.tabShow){
            return (
                <MdScrollableTabView
                    ref="ScrollableTabs"
                    renderTabBar={() => <MdTabBar
                        style={{width:width-nav_width,marginTop:0,height:40,alignItems:'flex-end',borderBottomWidth: 1,borderBottomColor:'#ccc'}}
                        tabBarTextStyle={{paddingLeft:20,paddingRight:20,fontWeight: 'bold'}}
                        tabMargin={10}
                        underlineColor={'@TabTextColor'}
                        underlineHeight={2}
                    />
                    }
                    tabBarActiveTextColor={'@TabTextColor'}
                    tabBarInactiveTextColor={'@ActiveTabTextColor'}
                >
                    <JingXuanPage tabLabel={{label:'精选'}} {...this.props} />
                    {/*<AvHot tabLabel={{label: '最热'}} {...this.props}/>*/}
                    <AvList tabLabel={{label: '最新'}} tabId={0} key={0} page={0} {...this.props}/>
                    {
                        NavDate.map((item,key)=>{
                                return <AvList tabLabel={{label: item.name}} tabId={item.id} key={key} page={0} {...this.props}/>
                            }
                        )
                    }

                </MdScrollableTabView>
            )
        }
    }

    render(){
        return(
            <MdSafeAreaView style={{flex:1,backgroundColor:'@BackgroundColor'}} forceInset={{ bottom: 'never' }}>
                <View style={{flex:1}}>
                    <TouchableOpacity onPress={()=>this.props.navigation.navigate('AvSearch')} activeOpacity={0.5} style={styles.searchBox}>
                        <Image source={require('../../res/images/common/ic_search.png')} style={styles.searchImg} />
                    </TouchableOpacity>
                    {this.renderScrollableTab()}
                    <Modal
                        animationType="none"
                        transparent={true}
                        visible={this.state.pingzheng}
                    >
                        <View style={{backgroundColor:'rgba(0,0,0,0.6)',flex:1,justifyContent:'center',alignItems:'center'}}>
                            <View style={{backgroundColor:'#fff',borderRadius:5,width:width*2/3}}>
                              <Text style={{fontWeight: 'bold',fontSize:18,lineHeight:24,textAlign:'center',marginVertical:20}}>登陆凭证保存</Text>
                              <Text style={{fontSize:14,paddingHorizontal: 20,lineHeight:20}}>使用凭证可防止账户丢失后无法登陆, 我的->账号信息->保存凭证</Text>
                              <Button style={{backgroundColor:'@ThemeColor',margin:20,height:40,borderRadius:5}} onPress={()=>this.savePingZheng()}>
                                  <Text style={{fontSize:18,color:'#fff',lineHeight:40,textAlign:'center'}}>立即去保存</Text>
                              </Button>

                            </View>
                        </View>
                    </Modal>
                </View>
            </MdSafeAreaView>
        )
    }

}

const styles = StyleSheet.create({
    searchBox: {
        borderBottomWidth: 1,
        borderBottomColor:'#ccc',
        alignItems:'center',
        justifyContent: 'center',
        position:'absolute',
        right:0,
        top:0,
        width:nav_width,
        height:40,
        zIndex: 1
    },
    searchImg:{
        width:20,
        height:20,
        // margin: 10,
    },
});

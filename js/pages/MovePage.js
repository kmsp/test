/**
 * 小视频界面
 */
import React, {Component} from 'react';
import {StyleSheet, View, Image, SafeAreaView, Dimensions, TouchableOpacity} from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import TabBar from "react-native-underline-tabbar";
import MoveList from "./move/MoveList";
import MoveSearch from "./move/MoveSearch"
import {createThemedComponent} from "react-native-theming";

const { width, height } = Dimensions.get('window');
const nav_width = 60;

const MdSafeAreaView = createThemedComponent(SafeAreaView);
const MdScrollableTabView = createThemedComponent(ScrollableTabView,['tabBarActiveTextColor','tabBarInactiveTextColor']);
const MdTabBar = createThemedComponent(TabBar,['underlineColor']);

export default class AvPage extends Component{
    constructor(props) {
        super(props);
        this.state = {
            tabShow: false,
            NavDate: [],
        };
    }

    componentDidMount() {
        this.getNavDate();
    }

    componentWillMount() {
    }

    componentWillUnmount() {
    }

    getNavDate(){
        return fetch(global.ActiveDomain+"/nav/2")
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

    // 滑动tab
    renderScrollableTab() {
        let NavDate = this.state.NavDate;
        if (this.state.tabShow){
            return (
                <MdScrollableTabView
                    renderTabBar={() => <MdTabBar
                        style={{width:width-nav_width,marginTop:0,height:40,alignItems:'flex-end',borderBottomWidth: 1,borderBottomColor:'#ccc'}}
                        tabBarTextStyle={{paddingLeft:20,paddingRight:20,fontWeight: 'bold'}}
                        tabMargin={1}
                        underlineColor={'@TabTextColor'}
                        underlineHeight={2}
                    />
                    }
                    tabBarActiveTextColor={'@TabTextColor'}
                    tabBarInactiveTextColor={'@ActiveTabTextColor'}
                >
                    <MoveList tabLabel={{label: '最新'}} tabId={0} key={0} page={0} {...this.props}/>
                    {
                        NavDate.map((item,key)=>{
                                return <MoveList tabLabel={{label: item.name}} tabId={item.id} key={key} page={0} {...this.props}/>
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
                    <TouchableOpacity onPress={()=>this.props.navigation.navigate('MoveSearch')} activeOpacity={0.5} style={styles.searchBox} {...this.props}>
                        <Image source={require('../../res/images/common/ic_search.png')} style={styles.searchImg} />
                    </TouchableOpacity>
                    {this.renderScrollableTab()}
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

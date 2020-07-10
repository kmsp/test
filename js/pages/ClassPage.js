/**
 * 分类界面
 */
import React, {Component} from 'react';
import {Image, StyleSheet, Text, View, SafeAreaView, Dimensions} from 'react-native';
import NvyouList from "./class/NvyouList";
import AvClass from "./class/AvClass";
import MoveClass from "./class/MoveClass";
import ScrollableTabView from "react-native-scrollable-tab-view";
import TabBar from "react-native-underline-tabbar";
import { createThemedComponent } from 'react-native-theming';

const { width, height } = Dimensions.get('window');
const MdSafeAreaView = createThemedComponent(SafeAreaView);
const MdScrollableTabView = createThemedComponent(ScrollableTabView,['tabBarActiveTextColor','tabBarInactiveTextColor']);
const MdTabBar = createThemedComponent(TabBar,['underlineColor']);

export default class ClassPage extends Component{
    componentWillMount() {
    }

    componentWillUnmount() {
    }

    render(){
        return(
            <MdSafeAreaView style={{flex:1,backgroundColor: '@BackgroundColor'}} forceInset={{ bottom: 'never' }}>
                <MdScrollableTabView
                    renderTabBar={() => <MdTabBar
                        style={{width:width,marginTop:0,height:40,alignItems:'flex-end'}}
                        tabBarTextStyle={{width:width/3,textAlign:'center',fontWeight: 'bold'}}
                        tabMargin={1}
                        underlineColor={'@ThemeColor'}
                        underlineHeight={2}
                    />
                    }
                    tabBarActiveTextColor={'@TabTextColor'}
                    tabBarInactiveTextColor={'@ActiveTabTextColor'}
                >
                    <NvyouList tabLabel={{label:'女优列表'}} {...this.props} />
                    <AvClass tabLabel={{label:'AV分类'}} {...this.props} />
                    <MoveClass tabLabel={{label:'短片分类'}} {...this.props} />
                </MdScrollableTabView>
            </MdSafeAreaView>
        )
    }
}

/**
 * 收藏界面
 */
import React, {Component} from 'react';
import {Image, StyleSheet, Text, View, SafeAreaView, Dimensions} from 'react-native';
import NvyouLike from "./Collection/NvyouLike";
import AvLike from "./Collection/AvLike";
import MoveLike from "./Collection/MoveLike";
import ScrollableTabView from "react-native-scrollable-tab-view";
import TabBar from "react-native-underline-tabbar";
import {createThemedComponent} from "react-native-theming";
import Theme from "react-native-theming";
import Icon from "react-native-vector-icons/AntDesign";

const { width, height } = Dimensions.get('window');

const MdSafeAreaView = createThemedComponent(SafeAreaView);
const MdScrollableTabView = createThemedComponent(ScrollableTabView,['tabBarActiveTextColor','tabBarInactiveTextColor']);
const MdTabBar = createThemedComponent(TabBar,['underlineColor']);

export default class CollectionPage extends Component{
    constructor(props){
        super(props);

        //隐藏底部导航栏
        this.props.navigation.setParams({
            fullscreen: false,
        })
    }

    render(){
        return(
            <MdSafeAreaView style={{flex:1,backgroundColor:'@BackgroundColor'}} forceInset={{ bottom: 'never' }}>
                <Theme.View style={[styles.navBar,{backgroundColor:'@HomeColor'}]}>
                    <Icon onPress={()=>this.props.navigation.goBack()} name='left' style={styles.navBarIcon} />
                    <Text style={styles.navBarText}>收藏</Text>
                </Theme.View>
                <MdScrollableTabView
                    renderTabBar={() => <MdTabBar
                        style={{width:width,marginTop:0,height:40,alignItems:'flex-end'}}
                        tabBarTextStyle={{width:width/3,textAlign:'center',fontWeight: 'bold'}}
                        tabMargin={1}
                        underlineColor={'@TabTextColor'}
                        underlineHeight={2}
                    />
                    }
                    tabBarActiveTextColor={'@TabTextColor'}
                    tabBarInactiveTextColor={'@ActiveTabTextColor'}
                >
                    <NvyouLike tabLabel={{label:'女优'}} {...this.props} />
                    <AvLike tabLabel={{label:'AV'}} {...this.props} />
                    <MoveLike tabLabel={{label:'短片'}} {...this.props} />
                </MdScrollableTabView>
            </MdSafeAreaView>
        )
    }
}

const styles=StyleSheet.create({
    //顶部navBar样式
    navBar: {
        height: 44,
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
    }


});
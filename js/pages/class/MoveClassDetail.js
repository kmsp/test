import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Dimensions,
    SafeAreaView
} from 'react-native';
import Icon from "react-native-vector-icons/AntDesign";
import ScrollableTabView from "react-native-scrollable-tab-view";
import MoveItem from "../../common/MoveItem";
import TabBar from "react-native-underline-tabbar";
import {createThemedComponent} from "react-native-theming";
import Theme from "react-native-theming";

const { width, height } = Dimensions.get('window');

const MdSafeAreaView = createThemedComponent(SafeAreaView);
const MdScrollableTabView = createThemedComponent(ScrollableTabView,['tabBarActiveTextColor','tabBarInactiveTextColor']);
const MdTabBar = createThemedComponent(TabBar,['underlineColor']);

export default class MoveClassDetail extends Component{
    constructor(props){
        super(props);
        this.state = {
            navbar_title:'女优详情',
        }

        //隐藏底部导航栏
        this.props.navigation.setParams({
            fullscreen: false,
        })
    }

    componentDidMount(){
        if(this.props.navigation.getParam('navBarTitle')){
            this.setState({
                navbar_title:this.props.navigation.getParam('navBarTitle'),
            })
        }
    }

    componentWillMount() {
    }

    componentWillUnmount() {
    }

    render(){
        return(
            <MdSafeAreaView style={{flex:1,backgroundColor:'@BackgroundColor'}} forceInset={{ bottom: 'never' }}>
                <Theme.View style={[styles.navBar,{backgroundColor:'@HeadColor'}]}>
                    <Icon onPress={()=>this.props.navigation.goBack()} name='left' style={styles.navBarIcon} />
                    <Text style={styles.navBarText}>{this.state.navbar_title}</Text>
                </Theme.View>
                <View style={{flex:1}}>
                    <MdScrollableTabView
                        renderTabBar={() => <MdTabBar
                            style={{width:width,marginTop:0,height:40,alignItems:'flex-end',backgroundColor:'@BackgroundColor'}}
                            tabBarTextStyle={{width:width/2,textAlign:'center',fontWeight: 'bold'}}
                            tabMargin={1}
                            underlineColor={'@TabTextColor'}
                            underlineHeight={2}
                        />
                        }
                        tabBarActiveTextColor={'@TabTextColor'}
                        tabBarInactiveTextColor={'@ActiveTabTextColor'}
                    >
                        <MoveItem tabLabel={{label:'最新'}} typeId={2} cateId={this.props.navigation.getParam('cateId')} stateId={1} {...this.props}/>
                        <MoveItem tabLabel={{label:'热门'}} typeId={2} cateId={this.props.navigation.getParam('cateId')} stateId={2} {...this.props}/>
                    </MdScrollableTabView>
                </View>
            </MdSafeAreaView>
        )

    }

}

const styles=StyleSheet.create({
    //顶部navBar样式
    navBar: {
        height: 44,
        width:'100%',
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

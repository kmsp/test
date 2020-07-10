import React, {Component} from 'react';
import {StyleSheet, SafeAreaView, Text} from 'react-native';
import Icon from "react-native-vector-icons/AntDesign";
import MoveListHot from "../move/MoveListHot";
import Theme, {createThemedComponent} from "react-native-theming";

const MdSafeAreaView = createThemedComponent(SafeAreaView);

export default class NewMovieList extends Component{

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
                <Theme.View style={[styles.navBar,{backgroundColor:'@HeadColor'}]}>
                    <Icon onPress={()=>this.props.navigation.goBack()} name='left' style={styles.navBarIcon} />
                    <Text style={styles.navBarText}>{this.props.navigation.getParam('Title')}</Text>
                </Theme.View>
                <MoveListHot tabId={this.props.navigation.getParam('TabId')} page={0} {...this.props}/>
            </MdSafeAreaView>
        )
    }

}

const styles=StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    //顶部navBar样式
    navBar: {
        height: 44,
        width: '100%',
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
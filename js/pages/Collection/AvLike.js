/**
 * AV搜藏
 */
import React, {Component} from 'react';
import {Image, StyleSheet, Text, View, FlatList, ImageBackground} from 'react-native';
import AvItem from "../../common/AvItem";
import Theme from "react-native-theming";

export default class AvLike extends Component{

    constructor(props){
        super(props);
    }

    render(){
        return(
            <Theme.View style={{flex:1,backgroundColor:'@BackgroundColor'}}>
                <AvItem isLike={1} typeId={1} page={0} {...this.props}/>
            </Theme.View>
        )
    }

}

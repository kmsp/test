/**
 * 女优搜藏
 */
import React, {Component} from 'react';
import {Image, StyleSheet, Text, View, FlatList } from 'react-native';
import NvyouItem from '../../common/NvyouItem';
import Theme from "react-native-theming";


export default class NvyouLike extends Component{

    render(){

        return(
            <Theme.View style={{flex:1,backgroundColor:'@BackgroundColor'}}>
                <NvyouItem isLike={1} page={1} {...this.props}/>
            </Theme.View>
        )
    }

}

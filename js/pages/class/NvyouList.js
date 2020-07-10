/**
 * 女优列表
 */
import React, {Component} from 'react';
import {StyleSheet, Text, View, FlatList} from 'react-native';
import NvyouItem from "../../common/NvyouItem";
import Theme from 'react-native-theming';

const ZIMU = [{id:1,key:'A'},{id:2,key:'B'},{id:3,key:'C'},{id:4,key:'D'},{id:5,key:'E'},{id:6,key:'F'},{id:7,key:'G'},{id:8,key:'H'},{id:9,key:'I'},{id:10,key:'J'},{id:11,key:'K'},{id:12,key:'L'},{id:13,key:'M'},{id:14,key:'N'},{id:15,key:'O'},{id:16,key:'P'},{id:17,key:'Q'},{id:18,key:'R'},{id:19,key:'S'},{id:20,key:'T'},{id:21,key:'U'},{id:22,key:'V'},{id:23,key:'W'},{id:24,key:'X'},{id:25,key:'Y'},{id:26,key:'Z'}];

export default class NvyouList extends Component{

    constructor(props){
        super(props);
        this.state = {
            letterId:'',
        };
    }

    _changeId(id){
        this.setState({
            letterId:id,
        });
    }

    _changeIdAll(){
        this.setState({
            letterId:'',
        });
    }


    render(){

        return(
            <Theme.View style={{flex:1,backgroundColor:'@BackgroundColor'}}>
                <View style={styles.top}>
                    <Theme.Text onPress={()=>this._changeIdAll()} style={{paddingLeft:10,paddingRight:8,color:'@ThemeColor'}}>全部</Theme.Text>
                    <FlatList
                        data = {ZIMU}
                        horizontal = {true}
                        showsHorizontalScrollIndicator = {false}
                        keyExtractor = {(item,index)=>item.key}
                        renderItem = {({item})=>(
                            <Theme.Text onPress={()=>this._changeId(item.key)} style={[styles.zimu,{color:'@TextColor'}]}>{item.key}</Theme.Text>
                        )}
                    />
                </View>
                <View style={{flex:1}}>
                    <NvyouItem letterId={this.state.letterId} page={1} key={this.state.letterId} {...this.props} />
                </View>
            </Theme.View>
        )
    }

}



const styles = StyleSheet.create({
    top:{
        // backgroundColor:'red',
        flexDirection:'row',
        flexWrap:'nowrap',
        height: 44,
        lineHeight: 44,
        justifyContent:'center',
        alignItems:'center',
        borderBottomColor:'#ccc',
        borderBottomWidth: 1,
    },
    label:{
        borderWidth: 1,
        borderRadius:5,
        margin: 5,
        height:24,
        lineHeight:24,
        paddingLeft:5,
        paddingRight:5,
        justifyContent:'center',
        alignItems: 'center',
    },
    zimu:{
        paddingLeft:8,
        paddingRight:8,
    },


});
import {Component} from "react";
import {Dimensions, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import FastImage from 'react-native-fast-image';
import React from "react";
import Theme from "react-native-theming";
import {FetchRequest} from "../util/FetchRequest";

const deviceInfo = {
    deviceWidth: Dimensions.get('window').width,
    deviceHeight: Dimensions.get('window').height,
}

export default class NvyouItemSon extends Component{

    constructor(props){
        super(props);
        this.state={
            is_like:this.props.is_like
        }
    }

    //收藏
    _collection(item){
        this.setState({is_like:!this.state.is_like})
        FetchRequest(
            global.ActiveDomain+"/Favorite_actor",
            "ENCRYPTO",
            {
                a_id: item,
                account: global.UniqueId,
            }
        );

    }

    render(){
        const item = this.props.item;
        return(
            <View style={styles.imgson} key={item.id.toString()}>
                <TouchableOpacity onPress={()=>this.props.navigation.navigate('NvyouDetail',{actorId:item.id})} {...this.props}>
                    <FastImage source={{uri:(item.photo.startsWith('http') ? item.photo : global.ActiveDomain+item.photo)}} style={styles.img} resizeMode={'cover'} />
                </TouchableOpacity>
                <Theme.Text style={{marginTop:5,textAlign:'center',color:'@TextColor'}} numberOfLines={1}>{item.name}</Theme.Text>
                {this.state.is_like ? <Theme.Text style={[styles.soucangin,{backgroundColor: '@ThemeColor', borderColor: '@ThemeColor',}]} onPress={()=>this._collection(item.id)}>已收藏</Theme.Text> : <Theme.Text style={[styles.soucang,{color: '@ThemeColor', borderColor: '@ThemeColor',}]} onPress={()=>this._collection(item.id)}>收藏</Theme.Text>}
            </View>
        )
    }
}

const styles = StyleSheet.create({

    imgson:{
        width:deviceInfo.deviceWidth/4,
        justifyContent:'center',
        alignItems:'center',
        marginTop:8,
        padding:10,
    },
    img:{
        width: 80,
        height:80,
        borderRadius: 40,
    },
    soucang:{
        width:'100%',
        padding:4,
        borderRadius:13,
        borderWidth: 1,
        margin:5,
        textAlign:'center'
    },
    soucangin:{
        width:'100%',
        padding:4,
        color: '#fff',
        borderWidth: 1,
        margin:5,
        borderRadius:13,
        overflow:'hidden',
        textAlign:'center'
    },
});

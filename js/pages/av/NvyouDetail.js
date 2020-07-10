import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    SafeAreaView,
    Dimensions
} from 'react-native';
import Icon from "react-native-vector-icons/AntDesign";
import FastImage from 'react-native-fast-image';
import AvItem from "../../common/AvItem";
import Theme, {createThemedComponent} from "react-native-theming";
import Orientation from 'react-native-orientation';
import {FetchRequest} from "../../util/FetchRequest";

const MdSafeAreaView = createThemedComponent(SafeAreaView);

export default class NvyouDetail extends Component{
    constructor(props){
        super(props);
        this.state={
            actor:[],

        }

        //隐藏底部导航栏
        this.props.navigation.setParams({
            fullscreen: false,
        })
    }

    componentDidMount(){
        this.getActorData();
    }

    componentWillMount() {
       Orientation.lockToPortrait();
    }

    componentWillUnmount() {
       Orientation.lockToPortrait();
    }

    //获取演员信息
    getActorData() {
        return FetchRequest(
                global.ActiveDomain+"/Actor_infos",
                'ENCRYPTO',
                {
                  a_id: this.props.navigation.getParam('actorId'),
                  account: global.UniqueId,
                },
                (responseJson) => {
                    this.setState({actor:responseJson.data});
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


    render(){
        //第一次加载等待的view
        if (this.state.isLoading && !this.state.error) {
            return this._renderLoadingView();
        } else if (this.state.error) {
            //请求失败view
            return this._renderErrorView();
        }

        return(
            <MdSafeAreaView style={{flex:1,backgroundColor:'@BackgroundColor'}} forceInset={{ bottom: 'never' }}>
                <Theme.View style={[styles.navBar,{backgroundColor:'@HeadColor'}]}>
                    <Icon onPress={()=>this.props.navigation.goBack()} name='left' style={styles.navBarIcon} />
                    <Text style={styles.navBarText}>女优详情</Text>
                </Theme.View>
                <View style={styles.body}>
                    <View style={{flexDirection: 'row',alignItems: 'center',padding:15,borderBottomWidth: 1,borderBottomColor:'#ccc'}}>
                    {this.state.actor.photo?
                      <FastImage source={{uri:this.state.actor.photo}} style={{height: 80,width:80,borderRadius:40 }} resizeMode={'cover'} />:
                      <Image source={require('../../../res/images/loading.gif')} style={{height: 80,width:80,borderRadius:40 }} resizeMode={'cover'} />


                    }

                        <View style={{marginLeft: 15}}>
                            <Theme.Text style={{fontSize:16,color:'@TextColor'}}>{this.state.actor.name}</Theme.Text>
                            <Text style={{fontSize:12,color:'#999',marginTop: 5}}>作品数量:{this.state.actor.movie_num}</Text>
                            <Text style={{fontSize:12,color:'#999',marginTop: 5}}>人气:{this.state.actor.hot}</Text>
                        </View>
                        <View style={{flex:1,alignItems:'flex-end'}}>
                            {this.state.actor.is_like ? <Theme.Text style={[styles.soucangin,{backgroundColor: '@ThemeColor', borderColor: '@ThemeColor',}]}>已收藏</Theme.Text> : <Theme.Text style={[styles.soucang,{color: '@ThemeColor', borderColor: '@ThemeColor',}]}>收藏</Theme.Text>}
                        </View>
                    </View>
                    <View style={{flex:1}}>
                        <AvItem key={this.state.actor.id} typeId={1} actorId={this.state.actor.id} stateId={1} {...this.props} page={0}/>
                    </View>
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
    },

    body:{
       flex: 1,
    },
    soucang:{
       width:80,
        padding:4,
        borderRadius:13,
        borderWidth: 1,
        margin:5,
        textAlign: 'center'
    },
    soucangin:{
        width:80,
        padding:4,
        borderRadius:13,
        color: '#fff',
        overflow:'hidden',
        margin:5,
        textAlign:'center'
    },


});

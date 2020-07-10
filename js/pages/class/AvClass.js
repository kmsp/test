/**
 * AV分类
 */
import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
    Dimensions
} from 'react-native';
import FastImage from 'react-native-fast-image';
import AvClassDetail from "../class/AvClassDetail";
import Theme from "react-native-theming";
import Orientation from 'react-native-orientation';
import {FetchRequest} from "../../util/FetchRequest";


const { width, height } = Dimensions.get('window');

export default class AvClass extends Component{
    componentWillMount(){
        this.getData();
        Orientation.lockToPortrait();
    };

    componentWillUnmount() {
       Orientation.lockToPortrait();
    }

    constructor(props){
        super(props);
        this.state = {
            listData:'',
            ad:'',

            //网络请求状态
            isLoading: true,
            error: false,
            errorInfo: "",
        };
    }

    getData() {
        FetchRequest(
            global.ActiveDomain+"/Classification",
            "ENCRYPTO",
            {
                type: '1'

            },
            (responseJson) => {
                this.setState({
                    listData:responseJson.data.list,
                    ad:responseJson.data.ad[0],
                    isLoading:false,
                });

                // return responseJson.data;
                // console.log(this.state.ad['des']);
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


    _renderItem = ({item})=>(
        <TouchableOpacity style={styles.imgson} onPress={()=>this.props.navigation.navigate('AvClassDetail',{cateId:item.id,stateId:1,navBarTitle:item.name})} {...this.props}>
            <FastImage source={{uri:((item.img).startsWith('http') ? item.img : global.ActiveDomain + item.img)}} style={styles.img} />
            <Theme.Text style={{marginTop:5,textAlign:'left',color:'@TextColor'}} numberOfLines={1}>{item.name}</Theme.Text>
        </TouchableOpacity>
    );

    //加载等待页
    _renderLoadingView() {
        return (
            <Theme.View style={[styles.container,{alignItems:'center', justifyContent: 'center',backgroundColor: '@BackgroundColor'}]}>
                <ActivityIndicator
                    animating={true}
                    color='#7D3ED3'
                    size="large"
                />
            </Theme.View>
        );
    }

    //加载失败view
    _renderErrorView() {
        return (
            <Theme.View style={[styles.container,{backgroundColor: '@BackgroundColor'}]}>
                <Text>
                    加载失败
                </Text>
            </Theme.View>
        );
    }

    //点击广告
    _clickAd(item){
        FetchRequest(
            global.ActiveDomain+"/Advertising_records",
            "ENCRYPTO",
            {
                a_id: item.id,
                account: global.UniqueId,
            },
            (responseJson) => {
                if (responseJson.code === 200){

                    Linking.openURL(item.url)

                }else{
                    Alert.alert(
                        '温馨提示',
                        '请重试点击广告',
                        [
                            {text: '返回'},
                        ],
                        { cancelable: false }
                    )
                }
            },
            (error) => {
                Alert.alert(
                        '温馨提示',
                        '请重试点击广告',
                        [
                            {text: '返回'},
                        ],
                        { cancelable: false }
                    )
                console.error(error);
            }
        )

    }

    render(){

        //第一次加载等待的view
        if (this.state.isLoading && !this.state.error) {
            return this._renderLoadingView();
        } else if (this.state.error) {
            //请求失败view
            return this._renderErrorView();
        }

        return(
            <View style={[styles.imgview,{backgroundColor: '@BackgroundColor'}]}>
                {
                    (this.state.ad.img).length !== '' && (this.state.ad.img).length !== null ?
                        <TouchableOpacity activeOpacity={1} onPress={()=>this._clickAd(this.state.ad)}>
                            <FastImage source = {{uri:((this.state.ad.img).startsWith('http') ? this.state.ad.img : global.ActiveDomain + this.state.ad.img)}} style={{height: (width-20)/5.03125,resizeMode:'cover',marginTop: 5,marginHorizontal:10,borderRadius:5}} />
                        </TouchableOpacity>
                        :
                        null
                }
                <FlatList
                    keyExtractor={(item, index) => item.id}
                    data = {this.state.listData}
                    numColumns = {3}
                    showsHorizontalScrollIndicator = {false}
                    renderItem = {this._renderItem}
                    style={{margin: 5}}
                />
            </View>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    imgview:{
        flex: 1,
    },
    imgson:{
        flex: 1,
        margin: 5,
    },
    img:{
        flex:1,
        width:'100%',
        height:140,
        borderRadius:5,
    }

});

/**
 * 视频分类
 */
import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Linking, Dimensions
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Theme from "react-native-theming";
import MoveClassDetail from './MoveClassDetail';
import TagDetail from './TagDetail';
import Orientation from 'react-native-orientation';
import {FetchRequest} from "../../util/FetchRequest";


const { width, height } = Dimensions.get('window');

export default class MoveClass extends Component{

    componentWillMount(){
        this.getData();
        this.getLabelData();
        Orientation.lockToPortrait();
    };

    componentWillUnmount() {
       Orientation.lockToPortrait();
    }

    constructor(props){
        super(props);
        this.state = {
            classData:[],
            ad:[],
            labelData: [],
            //网络请求状态
            isLoading: true,
            error: false,
            errorInfo: "",
        };
    }

    getData() {
        FetchRequest(global.ActiveDomain+"/Classification",
            "ENCRYPTO",
            {
                type: '2'

            },
            (responseJson) => {
                this.setState({
                    classData:responseJson.data.list,
                    ad:responseJson.data.ad[0],
                    isLoading:false,
                });
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

    getLabelData() {
        FetchRequest(
            global.ActiveDomain+"/Popular_tags",
            "ENCRYPTO",
            {

            },
            (responseJson) => {
                this.setState({labelData:responseJson.data});
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

        //分类
        let classItem = [];
        this.state.classData.forEach((item)=>{
            classItem.push(
                <TouchableOpacity key={item.id} style={styles.imgson} onPress={()=>this.props.navigation.navigate('MoveClassDetail',{cateId:item.id,stateId:1,navBarTitle:item.name})} {...this.props}>
                    <FastImage source={{uri:((item.img).startsWith('http') ? item.img : global.ActiveDomain + item.img)}} style={styles.img} />
                    <Theme.Text style={{marginTop:5,textAlign:'left',color:'@TextColor'}} numberOfLines={1}>{item.name}</Theme.Text>
                </TouchableOpacity>
            );
        });

        //热门标签
        let labelItem = [];
        this.state.labelData.forEach((v)=>{
            labelItem.push(
                <Theme.Text key={v.id} style={[styles.labelText,{color: '@ThemeColor', borderColor: '@ThemeColor',}]} onPress={()=>this.props.navigation.navigate('TagDetail',{labelId:v.id,stateId:1,navBarTitle:v.name})} {...this.props}>{v.name}</Theme.Text>
            );
        });

        return(
            <ScrollView>
                <View style={styles.imgview}>
                    {
                        (this.state.ad.img).length !== '' && (this.state.ad.img).length !== null ?
                            <TouchableOpacity activeOpacity={1} onPress={()=>this._clickAd(this.state.ad)}>
                                <FastImage source = {{uri:((this.state.ad.img).startsWith('http') ? this.state.ad.img : global.ActiveDomain + this.state.ad.img)}} style={{height: (width-20)/5.03125,resizeMode:'contain',marginTop: 5,marginHorizontal:10,borderRadius:5}} />
                            </TouchableOpacity>
                            :
                            null
                    }
                    <View style={{flexDirection: 'row',flexWrap: 'wrap',marginHorizontal:5}}>
                        {classItem}
                    </View>
                    <View style={{height:8,backgroundColor:'@JiangeColor'}} />
                    <View>
                        <Theme.Text style={{margin: 10,color:'@ThemeColor'}}>其他热门标签</Theme.Text>
                        <View style={{flexDirection: 'row',flexWrap: 'wrap',marginHorizontal:5}}>
                            {labelItem}
                        </View>
                    </View>
                </View>
            </ScrollView>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    imgview:{
         flex: 1,
    },
    imgson:{
        width:'33.33%',
        margin: 0,
        padding: 5,
    },
    img:{
        flex:1,
        width:'100%',
        height:140,
        resizeMode:'cover',
        borderRadius:5
    },
    labelText:{
        paddingVertical:2,
        paddingHorizontal:10,
        fontSize:12,
        lineHeight:16,
        borderRadius:10,
        borderWidth: 1,
        margin:5
    }
});

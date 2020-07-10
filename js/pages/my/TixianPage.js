import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    SafeAreaView,
    Dimensions,
    TouchableOpacity,
    Text,
    ScrollView,
    TextInput, ActivityIndicator
} from 'react-native';
import Icon from "react-native-vector-icons/AntDesign";
import Toast from "react-native-easy-toast";
import Theme, {createThemedComponent} from 'react-native-theming';
import Picker from 'react-native-picker';
import {FetchRequest} from "../../util/FetchRequest";


const { width, height } = Dimensions.get('window');
const Button = createThemedComponent(TouchableOpacity);

export default class TixianPage extends Component{

    constructor(props){
        super(props);
        this.state={
            TuiDate:[],
            PayList:[],
            SelectList:['请选择提现方式'],

            fee:'',
            type:'',
            typename:'',
            name:'',
            number:'',
            money:'',
            bank:'',
            pass:'',

            isLoading:true,
            error:'',
        };

        //隐藏底部导航栏
        this.props.navigation.setParams({
            fullscreen: false,
        })
    }

    componentDidMount(){
        this._getListDate();
    }



    _getListDate(){
        // fetch(global.ActiveDomain+"/tixian", {
        //     method: "GET",
        //     headers: {
        //         Accept: "application/json",
        //         "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify({
        //         account: global.UniqueId,
        //     })
        // })
        FetchRequest(
          global.ActiveDomain+"/Withdraw_info",
          'ENCRYPTO',
          {
            account: global.UniqueId,
          },
          (responseJson) => {
              console.log('tixian json', responseJson)
              const Temp = responseJson.data.tixian_way;
              const SelectList = Temp.map(v => {return v.type});
              this.setState({
                  SelectList:SelectList,
                  TuiDate:responseJson.data.tui,
                  PayList:responseJson.data.tixian_way,
                  type:responseJson.data.tixian_way[0].id,
                  typename:responseJson.data.tixian_way[0].type,
                  fee:responseJson.data.tixian_way[0].fee,
                  isLoading: false,
              });

              Picker.init({
                  pickerData: this.state.SelectList,
                  pickerConfirmBtnText:'确定',
                  pickerCancelBtnText:'取消',
                  pickerTitleText:'请选择提现方式',
                  pickerBg:[245,245,245,1],
                  pickerFontSize:14,
                  onPickerConfirm: (pickedValue,key) => {
                      this._selectValue(pickedValue, key)
                  }
              });
              // alert(JSON.stringify(this.state.SelectList))
          },
          (error) => {
              // alert(error);
              Alert.alert(
                  '温馨提示',
                  error,
                  [
                      {text: '确定'},
                  ],
                  { cancelable: false }
              );
              this.props.navigation.goBack();
              console.error(error);
          }
          )
    }

    _selectValue(itemValue, itemIndex){
        // alert(itemValue+'-'+itemIndex)
        const fee = this.state.PayList[itemIndex].fee;
        const typename = this.state.PayList[itemIndex].type;
        this.setState({type: itemValue,fee:fee,typename:typename})
    }

    _doTixian(){
        FetchRequest(global.ActiveDomain+"/Withdraw",
            "ENCRYPTO",
            {
                account: global.UniqueId,
                type: this.state.type,
                name: this.state.name,
                number: this.state.number,
                money: this.state.money,
                bank: this.state.bank,
                pass:this.state.pass
            },
            (responseJson) => {
                if (responseJson.code === 200){
                    this.refs.toast.show('提现成功，请等待客服处理');
                    this.props.navigation.goBack();
                }else{
                    this.refs.toast.show(responseJson.msg);
                }
            },
            (error) => {
                this.refs.toast.show(error);
                console.error(error);
            }
        )
    }

    //加载等待页
    _renderLoadingView() {
        return (
            <Theme.View style={[styles.container,{alignItems:'center', justifyContent: 'center',backgroundColor:'@BackgroundColor',flex:1}]}>
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
            <Theme.View style={[styles.container,{backgroundColor:'@BackgroundColor',flex:1}]}>
                <Text>
                    加载失败
                </Text>
            </Theme.View>
        );
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
            <SafeAreaView style={{flex:1}} forceInset={{ bottom: 'never' }}>
                <Theme.View style={[styles.navBar,{backgroundColor:'@HeadColor'}]}>
                    <Icon onPress={()=>this.props.navigation.goBack()} name='left' style={styles.navBarIcon} />
                    <Text style={styles.navBarText}>提现</Text>
                </Theme.View>
                <ScrollView style={{flex:1}}>
                    <Theme.View style={[styles.top,{backgroundColor:'@BackgroundColor2'}]}>
                        <Text style={{color:'#fff',marginTop: 8}}>总业绩：{this.state.TuiDate.all_num}  余额：{this.props.navigation.getParam('Money')}元</Text>
                        <View style={{flexDirection:'row',justifyContent:'space-around',paddingVertical: 10}}>
                            <View style={styles.top_item}>
                                <Text style={styles.top_item_title}>一级推广</Text>
                                <Text style={styles.top_item_des}>{this.state.TuiDate.one_tui}</Text>
                            </View>
                            <View style={[styles.top_item,styles.top_item_border]} >
                                <Text style={styles.top_item_title}>二级推广</Text>
                                <Text style={styles.top_item_des}>{this.state.TuiDate.two_tui}</Text>
                            </View>
                            <View style={[styles.top_item,styles.top_item_border]}>
                                <Text style={styles.top_item_title}>三级推广</Text>
                                <Text style={styles.top_item_des}>{this.state.TuiDate.three_tui}</Text>
                            </View>
                            <View style={[styles.top_item,styles.top_item_border]} >
                                <Text style={styles.top_item_title}>四级推广</Text>
                                <Text style={styles.top_item_des}>{this.state.TuiDate.four_tui}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row',marginTop:8}}>
                            <Text style={styles.topbotton} onPress={()=>this.props.navigation.navigate('ShouYiPage')}>收益明细</Text>
                            <Text style={styles.topbotton} onPress={()=>this.props.navigation.navigate('TixianJiluPage')}>提现记录</Text>
                        </View>
                    </Theme.View>
                    <Theme.View style={{backgroundColor:'@BackgroundColor'}}>
                        <View style={{flexDirection:'row',justifyContent:'space-between',paddingHorizontal: 10,borderBottomColor:'#eee',borderBottomWidth: 1}}>
                            <Text style={{fontSize:12,color:'#999',lineHeight:50}}>提现方式</Text>
                            <Text style={{color:'#000',lineHeight:50,flex:1,textAlign:'right'}} onPress={()=>Picker.show()}>
                                {this.state.typename}▼
                            </Text>
                        </View>
                        <View style={{flexDirection:'row',justifyContent:'space-between',paddingHorizontal: 10,borderBottomColor:'#eee',borderBottomWidth: 1}}>
                            <Text style={{fontSize:12,color:'#999',lineHeight:50}}>提现手续费</Text>
                            <Text style={{color:'#000',lineHeight:50}}>{this.state.fee}%</Text>
                        </View>
                        <View style={{flexDirection:'row',justifyContent:'space-between',paddingHorizontal: 10,borderBottomColor:'#eee',borderBottomWidth: 1}}>
                            <Text style={{fontSize:12,color:'#999',lineHeight:50}}>收款人姓名</Text>
                            <TextInput onChangeText={(text)=>this.setState({name:text})} placeholder={'请输入收款人姓名'} placeholderTextColor={'#c7c7cc'} style={{lineHeight:50,flex:1,height:50,textAlign:'right'}} />
                        </View>
                        <View style={{flexDirection:'row',justifyContent:'space-between',paddingHorizontal: 10,borderBottomColor:'#eee',borderBottomWidth: 1}}>
                            <Text style={{fontSize:12,color:'#999',lineHeight:50}}>收款银行</Text>
                            <TextInput onChangeText={(text)=>this.setState({bank:text})} placeholder={'请输入收款银行'} placeholderTextColor={'#c7c7cc'} style={{lineHeight:50,flex:1,height:50,textAlign:'right'}} />
                        </View>
                        <View style={{flexDirection:'row',justifyContent:'space-between',paddingHorizontal: 10,borderBottomColor:'#eee',borderBottomWidth: 1}}>
                            <Text style={{fontSize:12,color:'#999',lineHeight:50}}>{this.state.typename}账号</Text>
                            <TextInput onChangeText={(text)=>this.setState({number:text})} placeholder={'请输入'+this.state.typename+'账户'} placeholderTextColor={'#c7c7cc'} style={{lineHeight:50,flex:1,height:50,textAlign:'right'}} />
                        </View>
                        <View style={{flexDirection:'row',justifyContent:'space-between',paddingHorizontal: 10,borderBottomColor:'#eee',borderBottomWidth: 1}}>
                            <Text style={{fontSize:12,color:'#999',lineHeight:50}}>提现金额</Text>
                            <TextInput onChangeText={(text)=>this.setState({money:text})} placeholder={'请输入提现金额'} placeholderTextColor={'#c7c7cc'} style={{lineHeight:50,flex:1,height:50,textAlign:'right'}}/>
                            <Text style={{fontSize:15,color:'#999',lineHeight:50}}>元</Text>
                        </View>
                        <View style={{flexDirection:'row',justifyContent:'space-between',paddingHorizontal: 10,borderBottomColor:'#eee',borderBottomWidth: 1}}>
                            <Text style={{fontSize:12,color:'#999',lineHeight:50}}>{this.state.typename}安全码</Text>
                            <TextInput secureTextEntry={true} onChangeText={(text)=>this.setState({pass:text})} placeholder={'请输入安全码'} placeholderTextColor={'#c7c7cc'} style={{lineHeight:50,flex:1,height:50,textAlign:'right'}} />
                        </View>
                    </Theme.View>
                    <Theme.View style={{flex:1,backgroundColor:'@BackgroundColor'}}>
                        <Button style={{marginVertical:20,marginHorizontal:40,height:40,borderRadius:5,backgroundColor:'@ThemeColor'}} onPress={()=>this._doTixian()}>
                            <Text style={{fontSize:14,color:'#fff',lineHeight:40,textAlign:'center'}}>提交申请</Text>
                        </Button>
                        <Theme.Text style={{color:'@TextColor',fontSize:12,marginHorizontal:40,lineHeight:20}}>#余额来源：当别人（注：新用户）通过你的推广链接下载打开APP后（或输入你的邀请码）即可建立邀请关系，每次他购买会员都会返利给你</Theme.Text>
                    </Theme.View>
                </ScrollView>
                <Toast
                    style={{opacity:0.6}}
                    textStyle={{color:'#FFF'}}
                    position={'bottom'}
                    ref="toast"
                />
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
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
    },

    top: {
        paddingVertical:20,
        alignItems: 'center',
    },
    topbotton:{
        lineHeight:20,
        fontSize:12,
        color:'#7D3ED3',
        backgroundColor: '#fff',
        paddingLeft:8,
        paddingRight:8,
        marginRight: 10,
        borderRadius:5,
        overflow: 'hidden',
    },
    top_item:{
        alignItems:'center',
        width:(width-3)/4
    },
    top_item_border:{
        borderLeftColor:'#efefef',
        borderLeftWidth: 1
    },
    top_item_title:{
        fontSize:12,color:'#fff',lineHeight:16
    },
    top_item_des:{
        fontSize:12,color:'#fff',lineHeight:16
    }
});

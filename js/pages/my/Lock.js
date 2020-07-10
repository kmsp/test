import React,{Component} from 'react';
import {
    Text,
    View,
    Modal,
    TouchableOpacity,
    TouchableHighlight,
    StyleSheet,
    Dimensions
} from 'react-native';
var {height,width} = Dimensions.get('window');
import DeviceStorage from '../../util/DeviceStorage';

export default class Lock extends Component {
    constructor(props){
        super(props);
        this.state = {
            showModal:true,
            inputPwd:"",
            msg:"请输入密码",
            LockPass:'',    //是否有密码锁、密码锁密码
            newLockPass:'',    //新密码
            reLockPass:'',  //二次密码
        };
    }

    componentDidMount(){
        DeviceStorage.get('LockPass').then((result) => {
            if (result !== null) {
                this.setState({
                    LockPass:result
                })
            }

        });
    }

    componentWillUnmount(){
        //跳出页面，清空临时数据
        this.setState({
            newLockPass:'',    //新密码
            reLockPass:'',  //二次密码
        })
    }

    pressNum(num){
        let pwd = this.state.inputPwd;
        this.setState({
            inputPwd:pwd+""+num,
        });
        this.renderPwd();
        setTimeout(()=>{
            let inputPwd = this.state.inputPwd;
            if(pwd.length==5){
                //如果设置了密码
                //如果有密码、验证密码
                if (this.state.LockPass){
                    if(this.state.LockPass == inputPwd){
                        //ToDo密码成功，删除密码
                        this.setState({
                            msg:'清除密码成功',
                        });
                        DeviceStorage.delete('LockPass');
                        this.props.navigation.state.params.refresh();
                        this.props.navigation.goBack();
                    } else {
                        this.setState({
                            msg:'密码错误，请重新输入',
                        });
                        setTimeout(()=>{
                            this.setState({
                                inputPwd:"",
                                msg:'请输入密码',
                            });
                        },1000);
                    }
                }else{
                    //设置密码
                    if (this.state.newLockPass){
                        if (this.state.newLockPass == inputPwd) {
                            //如果输入了两遍正确密码，设置密码，跳转回去
                            this.setState({
                                msg:'设置密码成功',
                            });
                            DeviceStorage.save('LockPass',this.state.newLockPass);
                            this.props.navigation.state.params.refresh();
                            this.props.navigation.goBack();
                        }else{
                            //第二遍密码不正确
                            this.setState({
                                msg:'重复密码错误，请重新输入',
                            });
                            setTimeout(()=>{
                                this.setState({
                                    inputPwd:"",
                                    msg:'请重新输入密码',
                                });
                            },1000);
                        }
                    } else {
                        //输入第一遍密码
                        this.setState({
                            newLockPass:inputPwd,
                            inputPwd:'',
                            msg:'请再次输入密码',
                        });
                    }
                }
            }
        },10);
    }
    deleteNum(){
        let pwd = this.state.inputPwd;
        pwd = pwd.substring(0,pwd.length-1);
        this.setState({
            inputPwd:pwd,
        });
        this.renderPwd();
    }
    //刷新密码状态
    renderPwd(){
        var vi = [];
        var inputPwd = this.state.inputPwd;
        for(var i=0; i<6; i++){
            if(i <= inputPwd.length-1){
                vi.push(<View key={i} style={styles.blackPoint}></View>);
            } else {
                vi.push(<View key={i} style={styles.whitePoint}></View>);
            }
        }
        return vi;
    }
    render(){
        return(
            <View style={{flex:1,backgroundColor:'white'}}>
                <Modal visible={this.state.showModal}
                       transparent={true}
                       animationType='fade'
                       onRequestClose={() => {}}
                       style={{flex:1}}
                       ref="pwdmodal"
                >
                    <View style={{flex:1,justifyContent:'center',alignItems:'center',

                        backgroundColor:'#2A3740',paddingLeft:30,paddingRight:30}}>
                        <View style={{justifyContent:'center',alignItems:'center',marginTop:20}}>
                            <Text style={{fontSize:16,color:'#fff'}}>{this.state.msg}</Text>
                        </View>
                        <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',height:60}}>
                            {this.renderPwd()}
                        </View>
                        <View style={{width:width-60,}}>
                            <View style={styles.row}>
                                <NumComp num="1" pressNum={()=>this.pressNum(1)}/>
                                <NumComp num="2" pressNum={()=>this.pressNum(2)}/>
                                <NumComp num="3" pressNum={()=>this.pressNum(3)}/>
                            </View>
                            <View style={styles.row}>
                                <NumComp num="4" pressNum={()=>this.pressNum(4)}/>
                                <NumComp num="5" pressNum={()=>this.pressNum(5)}/>
                                <NumComp num="6" pressNum={()=>this.pressNum(6)}/>
                            </View>
                            <View style={styles.row}>
                                <NumComp num="7" pressNum={()=>this.pressNum(7)}/>
                                <NumComp num="8" pressNum={()=>this.pressNum(8)}/>
                                <NumComp num="9" pressNum={()=>this.pressNum(9)}/>
                            </View>
                            <View style={styles.row}>
                                <NumComp num="取消" textStyle={{fontSize:16}} style={{borderWidth:0}} pressNum={()=>this.props.navigation.goBack()}/>
                                <NumComp num="0" pressNum={()=>this.pressNum(0)}/>
                                <NumComp num="删除" textStyle={{fontSize:16}} style={{borderWidth:0}} pressNum={()=>this.deleteNum()}/>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }
}
class NumComp extends Component{
    render(){
        return(
            <View style={[styles.gridView,]}>
                <TouchableOpacity activeOpacity={0.1} onPress={this.props.pressNum}>
                    <View style={[styles.cycle,this.props.style]}>
                        <Text style={[styles.numText,this.props.textStyle]}>{this.props.num}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    row:{
        flexDirection:'row',
        height:60,
        marginTop:10,
        marginBottom:10,
    },
    whitePoint:{
        width:10,
        height:10,
        borderRadius:5,
        borderColor:'#fff',
        borderWidth:1,
        margin:5,
    },
    blackPoint:{
        width:10,
        height:10,
        borderRadius:5,
        borderColor:'#fff',
        borderWidth:1,
        margin:5,
        backgroundColor:'white',
    },
    gridView:{
        flex:1,
        width:60,
        justifyContent:'center',
        alignItems:'center',
    },
    cycle:{
        height:60,
        width:60,
        marginLeft:5,
        marginRight:5,
        borderRadius:30,
        borderColor:'#fff',
        borderWidth:StyleSheet.hairlineWidth,
        backgroundColor:'#2A3740',
        justifyContent:'center',
        alignItems:'center',
    },
    numText:{
        color:'white',
        fontSize:20,
        fontWeight:'bold',
    },
});
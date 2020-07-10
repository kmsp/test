import React, {
    Component,
} from 'react';
import {
    View,
    ActivityIndicator,
    Text,
    TouchableOpacity,
    Image,
} from 'react-native';
import Theme, {createTheme, createThemedComponent} from 'react-native-theming';
const Button = createThemedComponent(TouchableOpacity);

export default class NoNetworkContainer extends Component {

    render() {
        let {message} = this.props;
        return (
            <View style={{position:'absolute',top:0,bottom:40,right:0,left:0,justifyContent:'center',alignItems:'center'}}>
                <View style={{width:'100%',height:'100%',borderRadius:5,justifyContent:'center',alignItems:'center',backgroundColor:'#ffffff',opacity:0.8}}>
                <Image style={{width:'100%',height:'90%',backgroundColor:'#eee',borderRadius:5}} source={require('../../res/images/common/无网络.png')} resizeMode={'cover'} resizeMethod={'resize'} />
                <Button onPress={()=>this.props.navigate('DownloadPage')} style={{
                    backgroundColor: '@ThemeColor',
                    width: '100%',
                    height: 40,
                    borderRadius: 5,
                }}>
                    <Text style={{color: '#FFF', lineHeight: 30, textAlign: 'center'}}>没有网络，进入下载页面</Text>
                </Button>
                    <Text style={{marginTop:10,color:'white'}}>{message}</Text>
                </View>
            </View>
        )
    }
}

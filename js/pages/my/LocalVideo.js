import React, {Component} from 'react';
import {SafeAreaView, StatusBar,View} from 'react-native';
import Theme,{createThemedComponent} from "react-native-theming";
import Orientation from "react-native-orientation";
import RNFetchBlob from 'rn-fetch-blob';
import VideoPlayer from "../../video/VideoPlayerlocal";
import fs from 'react-native-fs'
import '../../util/ScreenUtils.js';
const MdSafeAreaView = createThemedComponent(SafeAreaView);

let Url = '';
let playUrl = '';
const baseFile =global.DEVICE.android ? fs.ExternalDirectoryPath : fs.LibraryDirectoryPath + "/ColaApp";

export default class LocalVideo extends Component{
    /*static navigationOptions = ({ navigation }) => {
        const { state } = navigation;
        const tabBarVisible = state.params ? state.params.fullscreen : true;
        return {
            // For the tab navigators, you can hide the tab bar like so
            tabBarVisible,
        }
    };*/

    constructor(props){
        super(props);
        this.state={
            MovieDetail:this.props.navigation.getParam('MovieDetail'),
        };

        //隐藏底部导航栏
        this.props.navigation.setParams({
            fullscreen: false,
        })

        playUrl = this.state.MovieDetail.localurl
        console.warn('playUrl', playUrl);


    }


    _onLayoutChange = (event) => {
        let {x, y, width, height} = event.nativeEvent.layout;
        let isLandscape = (width > height);
        if (isLandscape) {
            this.setState({
                isFullScreen: true,
                videoHeight: height,
                showHidden:true,
            });
            this.videoPlayer.updateLayout(width, height, true);
            /*this.props.navigation.setParams({
                fullscreen: false
            })*/
        } else {
            this.setState({
                isFullScreen: false,
                videoHeight: width * 9/16
            });
            this.videoPlayer.updateLayout(width, width * 9/16, false);
            this.props.navigation.setParams({
                // fullscreen: true,
                showHidden:true,
            })
        }
        // Orientation.unlockAllOrientations();
    };

    _onOrientationChanged = (isFullScreen) => {
        if (isFullScreen) {
            Orientation.lockToPortrait();
        } else {
            Orientation.lockToLandscapeRight();
        }
    };


    render(){
        return(
            <MdSafeAreaView style={{flex:1}}>
                <StatusBar
                    hidden={this.state.showHidden}
                />
                {
                    playUrl ?
                    <View style={{justifyContent: 'center',flex:1,backgroundColor:"#000"}} onLayout={this._onLayoutChange}>
                        <VideoPlayer
                            ref={(ref) => this.videoPlayer = ref}
                            videoID={this.state.MovieDetail.id}
                            videoURL={playUrl}
                            videoTitle={this.state.MovieDetail.title}
                            onChangeOrientation={this._onOrientationChanged}
                            onTapBackButton={()=>this.props.navigation.goBack()}
                        />
                    </View>
                    :
                    null
                }
            </MdSafeAreaView>
        )
    }

}

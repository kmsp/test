import React from 'react';
import { Button, View, Text } from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation'; // Version can be specified in package.json
import SplashScreen from 'react-native-splash-screen';
import WelCome from "./js/pages/WelComePage";
import StaticServerUtil from './js/util/StaticServerUtil'


export default class App extends React.Component {


    componentDidMount(){
        SplashScreen.hide();
        StaticServerUtil.start()
    }

    render() {
        return <WelCome />;
    }
}

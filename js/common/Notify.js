import React, {
    Component,
} from 'react';
import {
    View,
    ActivityIndicator,
    Text
} from 'react-native';
import RootSiblings from 'react-native-root-siblings';
import { Card, ListItem, Button, Icon } from 'react-native-elements'


class NotifyContainer extends Component {

    render() {
        let {message} = this.props;
        return (
            <Card title="通知">
              <Text style={{marginBottom: 10}}>
                {message}
              </Text>
              <Button
                icon={<Icon name='code' color='#ffffff' />}
                buttonStyle={{borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                title='已知道' />
            </Card>
        )
    }
}

export default class Notify {

    static show = (message = "努力加载中...") => {
        return new RootSiblings(<NotifyContainer message={message}></NotifyContainer>);
    };

    static hide = obj => {
        if (obj instanceof RootSiblings) {
            obj.destroy();
        } else {
            console.warn(`Toast.hide expected a \`RootSiblings\` instance as argument.\nBut got \`${typeof obj}\` instead.`);
        }
    };
}

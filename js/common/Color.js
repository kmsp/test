import { createTheme } from 'react-native-theming'

const Color = [

    createTheme({
        ThemeColor: '#7D3ED3',
        HeadColor: '#FFF',
        BackgroundColor: '#FFF',
        BackgroundColor2: '#7D3ED3',
        BackgroundColor3: '#EEE',
        TextColor:'#333',
        HeadTextColor:'#000',
        WriteTextColor:'#FFF',
        BlackTextColor:'#000',
        LabelTextColor:'#999',
        JiangeColor:'#f9f9f9',
        TabTextColor:'#7D3ED3',
        ActiveTabTextColor:'#333',
        SearchBoxBackgroundColor:'#EDEDED',
        SearchBoxColor:'#000',
        MyPageTextColor:'#333',
        MyPageTextColor2:'#c9c9c9',
        LineColor:'#DDD',
        BlackLineColor:'#1D1D1D'
    }, 'lightTheme'),
    createTheme({
        ThemeColor: '#7D3ED3',
        BackgroundColor: '#1E1E1E',
        BackgroundColor2: '#7D3ED3',
        BackgroundColor3: '#EEE',
        TextColor:'#AAA',
        WriteTextColor:'#FFF',
        BlackTextColor:'#000',
        LabelTextColor:'#999',
        JiangeColor:'#282828',
        TabTextColor:'#7D3ED3',
        ActiveTabTextColor:'#686868',
        SearchBoxBackgroundColor:'#686868',
        SearchBoxColor:'#FFF',
        MyPageTextColor:'#686868',
        MyPageTextColor2:'#c9c9c9',
        LineColor:'#DDD',
        BlackLineColor:'#1D1D1D'
    }, 'darkTheme'),

];

export default Color;

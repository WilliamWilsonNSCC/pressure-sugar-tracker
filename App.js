import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Navigator from './navigation/Navigator';

export default function App() {
  return (
    // <View style={styles.container}>
    //   <Text>THIS APP IS GOING TO HELP TRACK</Text>
    //   <Text>BLOOD PRESSURE AND BLOOD SUGAR LEVELS</Text>
    //   <StatusBar style="auto" />
    // </View>
    <NavigationContainer>
      <Navigator />
    </NavigationContainer>
  );
}

// export const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

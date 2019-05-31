import React from "react";
import { AsyncStorage } from 'react-native';
import localizedJSONTelugu from '../../assets/IN-TE';
import localizedJSONEngish from '../../assets/IN-EN';
import localizedJSONTamil from '../../assets/IN-TA';
export default async function getObjectForKey(key){
    var lang;
    var jsonValue;
    try {
        lang = await AsyncStorage.getItem('DEFAULT_LANGUAGE');
      } catch (error) {
        // Error retrieving data
      }
      console.log("Language in language Switch: " + lang);
    if(lang == "English"){
        jsonValue = localizedJSONEngish;
    }
    else if(lang == "Telugu"){
        jsonValue = localizedJSONTelugu;
    }
    else if(lang == "Tamil"){
        jsonValue = localizedJSONTamil;
    }
    return jsonValue[key];
}


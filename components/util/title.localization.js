import React from "react";
import localizedJSON from '../../assets/IN-TE';
export default async function getObjectForKey(key){
    const jsonValue = localizedJSON;
    return jsonValue[key];
}


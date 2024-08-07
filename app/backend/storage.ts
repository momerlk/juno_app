import * as React from 'react';
import { Platform } from 'react-native';

import * as SecureStore from 'expo-secure-store';

import AsyncStorage from '@react-native-async-storage/async-storage';

const production_url = "https://junoapi-production.up.railway.app"
const testing_url = "http://192.168.18.16:3001"

const base_url = production_url

const set = async (key: string, value: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error setting value", error);
  }
};

const getString = async (key: string): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Error getting string value", error);
    return null;
  }
};

const getBoolean = async (key: string): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null ? JSON.parse(value) : false;
  } catch (error) {
    console.error("Error getting boolean value", error);
    return false;
  }
};

const getNumber = async (key: string): Promise<number | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null ? Number(JSON.parse(value)) : null;
  } catch (error) {
    console.error("Error getting number value", error);
    return null;
  }
};

const remove = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing value", error);
  }
};

export const storage = {
  set,
  getString,
  getBoolean,
  getNumber,
  remove,
};

export function setToken(token : string){
  if (token === null || token.length === 0){
    return;
  }
  SecureStore.setItem('token', token);
}

export async function getToken() : Promise<null | string> {
  const res = await SecureStore.getItemAsync("token")

  if(res === null){
    return null;
  }
  // verify token
  const response = await fetch(`${base_url}/verify` , {
    method : "GET",
    headers : {
      "Authorization" : res,
      "Content-Type" : "application/json"
    }
  });
  if (!response.ok){
    return null;
  }

  return res;
}

export async function refreshToken() : Promise<null | string> {
  const old_token = await getToken();
  if(old_token === null){
    return null;
  }

  // verify token
  const response = await fetch(`${base_url}/refresh` , {
    method : "GET",
    headers : {
      "Authorization" : old_token,
      "Content-Type" : "application/json"
    }
  });

  if (!response.ok){
    return null;
  }

  const data = await response.json();

  return data.token;
}



export async function setObject(key : string , obj : Record<string,any> | null){
  if (obj === null){
    storage.set(key , "")
    return
  }
  await storage.set(key , JSON.stringify(obj))
}

export async function getObject(key : string) : Promise<Record<string,any> | null> {
  const str = await storage.getString(key)
  if (str === null){
    return null;
  }

  let parsed = null;
  try {
    parsed = JSON.parse(str)
  } catch(err){
    return null;
  }
  
  return parsed;
}






type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, null],
): UseStateHook<T> {
  return React.useReducer(
    (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
    initialValue
  ) as UseStateHook<T>;
}

export async function setStorageItemAsync(key: string, value: string | null) {
  if (Platform.OS === 'web') {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    if (value == null) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }
}

export function useStorageState(key: string): UseStateHook<string> {
  // Public
  const [state, setState] = useAsyncState<string>();

  // Get
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          setState(localStorage.getItem(key));
        }
      } catch (e) {
        console.error('Local storage is unavailable:', e);
      }
    } else {
      SecureStore.getItemAsync(key).then(value => {
        setState(value);
      });
    }
  }, [key]);

  // Set
  const setValue = React.useCallback(
    (value: string | null) => {
      setState(value);
      setStorageItemAsync(key, value);
    },
    [key]
  );

  return [state, setValue];
}

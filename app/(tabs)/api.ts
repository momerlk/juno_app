// All api related functions will be kept here instead of distributed across different files

import AsyncStorage from "@react-native-async-storage/async-storage"
import { router } from "expo-router";

const base_url = "http://localhost:8080"
const ws_base_url = "ws://localhost:8080"
const feed_url = `${ws_base_url}/feed`

export class WS {
    socket : WebSocket;
    open : boolean;
    constructor(url : string, onOpen: Function, onMessage : Function){
        this.socket = new WebSocket(url);
        this.open = false;
        this.socket.onopen = (ev : Event) => {
          this.open = true;
          onOpen();
        }
        this.socket.onerror = (error : any) => {
          alert(`failed to connect to websocket`)
          console.log(`failed to connect to websocket, error = ${error}`) 
        }
        this.socket.onmessage = (ev : MessageEvent<any>) => {
          onMessage(JSON.parse(ev.data));
        }
        this.socket.onclose = (ev : CloseEvent) => {
          this.open = false;
        }
    }

    sendJSON(data : any){
      this.socket.send(JSON.stringify(data));
    }

    send(message : any){
      this.socket.send(message)
    }

    close(){
      this.socket.close();
    }
}

export class WSFeed extends WS {
  constructor(token : string, setProducts : Function){
    super(`${feed_url}?token=${token}` , () => { // on open
      this.sendAction("open" , "" , null)
    } , (data : any) => { // on message
      setProducts(data);
    })
  }

  sendAction(action_type : string , product_id : string , query : any | null){
    if(query === null){
      this.sendJSON({
        user_id : "",
        action_type : action_type,
        action_timestamp : "",
        product_id : product_id,
      })
      return;
    }
    this.sendJSON({
      user_id : "",
      action_type : action_type,
      action_timestamp : "",
      product_id : product_id,
      query : query,
    })
  }
}

export function createQuery(text : any | null, filter : any | null){
  
  if(filter === null && text === null){
    return null;
  }

  if (text === null && filter !== null){
    return {
      filter : filter
    }
  }
  if (filter === null && text !== null){
    return {
      text : text,
    }
  }

  return {
    text : text, 
    filter : filter,
  }
}

export async function signIn(email : string, password : string){
    const response = await fetch(base_url + '/signIn', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "username_email" : email, "password" : password })
    });

    const data = await response.json();
    if (response.ok) {
        alert('signed in successfully');
        await AsyncStorage.setItem("authenticated" , "true")
        await AsyncStorage.setItem("token" ,  data.token)
        return true;
    } else {
        alert('failed to login, error: ' + data.message);
        return false;
    }
}

export async function signUp(email : string, number : string, password : string){
    const response = await fetch(base_url + '/signUp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "email" : email,
            "phone_number" : number  , 
            "password" : password,
        })
    });

    const data = await response.json();
    if (response.ok) {
        alert(data.message);
    } else {
        alert('Error: ' + data.message);
    }
}

export async function getProducts(n : number){
  const token = await AsyncStorage.getItem("token")
  if (token === null){
    alert(`Authenticate again`)
    return null;
  }
  const requestOptions = {
    method: "GET",
    headers: {
      "Authorization" : token!,
      "Content-Type" : "application/json",
    },
   };

  try {
    // TODO : change endpoint to liked
    const resp = await fetch(`${base_url}/products?n=${n}`, requestOptions);
    if (resp.status === 401){
        alert(`token expired sign in again`)
        router.replace("/sign-in")
        return null;
    } else if (resp.status !== 200){
        return null;
    }
    const data = await resp.json();

    return data;
  } catch(e){
    alert(`failed to get data = ${e}`)
    return null;
  }
}

export async function queryProducts(text : string, filter : any){
    await AsyncStorage.setItem("filter" , JSON.stringify(filter));
    const resp = await fetch(base_url + "/query", {
    method: "POST",
    headers: {
        "Content-Type" : "application/json",
    },
    body: JSON.stringify({
        text : text,
        filter : filter,
    }),
    })
    
    const products = await resp.json();
    if (products === null || products === undefined){
        return null;
    }

    return products;
}

export async function search(query : string){
  if(query === ""){
    return;
  }
  const resp = await fetch(`${base_url}/search?q=${query}`, {
    method : "GET",
    headers: {
                  'Content-Type': 'application/json',
              },
  });

  if (resp.status !== 200){
    return null;
  }
  const data = await resp.json();
  if(data === null || data === undefined){
    return null;
  }
  
  return data;
}

export async function getLiked(){
  const token = await AsyncStorage.getItem("token")
  if (token === null){
    alert(`Authenticate again`)
    return null;
  }
  const requestOptions = {
    method: "GET",
    headers: {
      "Authorization" : token!,
      "Content-Type" : "application/json",
    },
   };

  try {
    // TODO : change endpoint to liked
    const resp = await fetch(`${base_url}/liked`, requestOptions);
    if (resp.status === 401){
        alert(`token expired sign in again`)
        router.replace("/sign-in")
        return null;
    } else if (resp.status !== 200){
        return null;
    }
    const data = await resp.json();

    return data;
  } catch(e){
    alert(`failed to get data = ${e}`)
    return null;
  }
}
// All api related functions will be kept here instead of distributed across different files

import AsyncStorage from "@react-native-async-storage/async-storage"
import { router } from "expo-router";

const host_url = "192.168.18.16:3001"
const base_url = `http://${host_url}`
const ws_base_url = "ws://192.168.18.16:8080"

// TODO : Fix memory issue. these products data take too much memory javascript ran out of memory

export class WS {
    socket : WebSocket | null;
    open : boolean;
    constructor(url : string, onOpen: Function, onMessage : Function){
      this.socket = null;
      console.log(`new websocket object created`)
      try {
        this.socket = new WebSocket(url);
      } catch(e) {
        this.open = false;
        onOpen(this.open);
        return;
      }
      
      this.open = false;
      this!.socket.onopen = (ev : Event) => {
        this.open = true;
        onOpen(this.open);
      }
      this!.socket.onerror = (error : any) => {
        if (this.open === true){
          this.open = false;
        }
        console.error(`WS : failed to connect to websocket, error = ${JSON.stringify(error)}`) 
      }
      this!.socket.onmessage = (ev : MessageEvent<any>) => {
        try {
          onMessage(JSON.parse(ev.data));
        } catch(e) {
          console.error(`websocket failed to process data , error = ${e} , data = ${JSON.stringify(ev.data)}`)
        }
      }
      this!.socket.onclose = (ev : CloseEvent) => {
        this.open = false;
      }
    }

    sendJSON(data : any){
      if(this.socket !== null && this.open === true){
        this.socket.send(JSON.stringify(data));
      }
    }

    send(message : any){
      if(this.socket !== null && this.open === true){
        this.socket.send(message);
      }
    }

    close(){
      if(this.socket !== null && this.open === true){
        this.open = false;
        this.socket.close();
      }
    }
}

export class WSFeed extends WS {
  token : string;
  setProducts : Function;
  calledOpen : boolean;
  constructor(token : string, setProducts : Function){
    super(`${ws_base_url}/feed?token=${token}` , (open : boolean) => { // on open
      if (this.calledOpen === true) { return }
      this.sendAction("open" , "" , null)
      this.calledOpen = true;
    } , (data : any) => this.onMessage(data))

    this.calledOpen = false;
    
    this.token = token;
    this.setProducts = setProducts;
  }

  onMessage(data : any){
    this.setProducts(data);
  }

  async sendAction(action_type : string , product_id : string , 
    query : { filter: any; text?: undefined; } | { text: any; filter?: undefined; } | { text: any; filter: any; } | null){
    
    
    let data : any = {
      user_id : "",
      action_type : action_type,
      action_timestamp : "",
      product_id : product_id,
      query : query,
    }

    if(query === null){
      data = {
        user_id : "",
        action_type : action_type,
        action_timestamp : "",
        product_id : product_id,
      }
    }
    
    if(this.open === false){
      console.error(`resolving to http`)

      // TODO : Post action to database

      let products = null;
      if (query !== null){
        products = await queryProducts(query.text , query.filter)
      } else {
        products = await getProducts(5); 
      }
       
      if (products === null){
        alert(`failed to connect to server`)
        return;
      }
      if (products.length === 0){
        alert(`failed to connect to server`)
        return;
      }
      this.onMessage(products)

    } else {
      this.sendJSON(data)
    }

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


export async function getFilter(){
  const requestOptions = {
    method: "GET",
    "Content-Type" : "application/json",
  };

  const response = await fetch(base_url + "/filter", requestOptions)
  if (!response.ok){
    alert(`failed to get filter data from the internet`)
    return null;
  }
  const data = await response.json();

  return data;
}

export async function getCart(){
  let token = null
  try {
    token = await AsyncStorage.getItem("token");
    if (token === null){
      return null;
    }
  } catch(e){
    return null;
  }

  const response = await fetch(`${base_url}/cart` , {
    method : "GET",
    headers : {
      "Authorization" : token,
      "Content-Type" : "application/json",
    },
  })
  if (!response.ok){
    return null;
  }

  const data = await response.json();
  return data;
}
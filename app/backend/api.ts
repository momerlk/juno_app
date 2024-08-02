// All api related functions will be kept here instead of distributed across different files

import AsyncStorage from "@react-native-async-storage/async-storage"
import { router } from "expo-router";

const production_url = "https://junoapi-production.up.railway.app"
const testing_url = "http://192.168.18.16:3001"

const base_url = production_url
const ws_base_url = "ws://192.168.18.16:8080" // websockets are high unreliable right now

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
        console.log(`WS : failed to connect to websocket, error = ${JSON.stringify(error)}`) 
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
      console.log(`resolving to http`)

      // TODO : Post action to database
      let res = await postAction(data)
      if (res === false){
        alert(`failed to register swipe, check your internet or report bug`)
      }

      let products = null;
      if (query !== null){
        try {
          products = await queryProducts(query.text , query.filter)
        } catch (e) {
          console.error(`failed to get filter products , error = ${e}, query = ${JSON.stringify(query)}`)
          alert(`failed to get filtered products, check your internet or report bug`)
          return
        }
      } else {
        try {
          products = await getProducts(2); 
        } catch(e){
          console.error(`failed to get product recommendations , check your internet or report bug`)
          return
        }
      }
      
       
      if (products === null){
        console.error(`failed to get products data from server, check your internet or report bug`)
        return;
      }
      if (products.length === 0){
        console.error(`failed to get recommendations, product array is empty, check your internet or report bug`)
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
      text : "",
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
        await AsyncStorage.setItem("first_time", "no"); 
        return true;
    } else {
        console.error('failed to login, error: ' + data.message);
        alert(`failed to log in check details`)
        return false;
    }
}

export interface SignUpData {
  email : string;
  age : number; 
  gender : string;
  password : string;
  username : string;
  number : string;
  name : string;
}
export async function signUp(accountData : SignUpData){
    const response = await fetch(base_url + '/signUp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "email" : accountData.email,
            "phone_number" : accountData.number  , 
            "username" : accountData.username,
            "gender" : accountData.gender,
            "name" : accountData.name,
            "age" : accountData.age,
            "password" : accountData.password,
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
    router.navigate("/auth/sign-in")
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
        router.replace("/auth/sign-in")
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

export async function queryProducts(text : string, filter : any | null){
  if (filter === null){
    return
  }
  const token = await AsyncStorage.getItem("token")
  if (token === null){
    alert(`Authenticate again`)
    router.navigate("/auth/sign-in")
    return null;
  }
  await AsyncStorage.setItem("filter" , JSON.stringify(filter));
  const resp = await fetch(base_url + "/query", {
    method: "POST",
    headers: {
        "Authorization" : token,
        "Content-Type" : "application/json",
    },
    body: JSON.stringify({
        text : text,
        filter : filter,
    }),
  })

  if(resp.status === 200){
    let products = await resp.json();
    return products;
  }

  if (resp.status === 401){
    alert(`Authenticate again`)
    router.replace("/auth/sign-in")
    return null;
  }
  
  return null
}

export async function search(query : string, random? : "yes" | undefined, n? : number | undefined){
  if(query === ""){
    return;
  }
  let url = `${base_url}/search?q=${query}`
  if (random === "yes"){
    url += `&random=yes`
  }
  if (n !== undefined){
    url += `&n=${n}`
  }
  const resp = await fetch(url, {
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
    router.navigate("/auth/sign-in")
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
        router.replace("/auth/sign-in")
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

export async function getDetails(){
  let token = null
  try {
    token = await AsyncStorage.getItem("token");
    if (token === null){
      return null;
    }
  } catch(e){
    return null;
  }

  const response = await fetch(`${base_url}/details` , {
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

export async function postAction(action : any){
  let token = null
  try {
    token = await AsyncStorage.getItem("token");
    if (token === null){
      return false;
    }
  } catch(e){
    return false;
  }

  const response = await fetch(`${base_url}/feed/action`, {
    method : "POST",
    headers : {
        "Authorization" : token,
        "Content-Type" : "application/json",
      },
      body : JSON.stringify(action)
  })
  if (!response.ok){
    return false;
  }

  return true;
}

// UTILITY FUNCTIONS AND ALGORITHMS
export function fuzzysearch (needle: string, haystack: string) {
	const hlen = haystack.length;
	const nlen = needle.length;
	if (nlen > hlen) {
		return false;
	}
	if (nlen === hlen) {
		return needle === haystack;
	}
	outer: for (var i = 0, j = 0; i < nlen; i++) {
		var nch = needle.charCodeAt(i);
		while (j < hlen) {
			if (haystack.charCodeAt(j++) === nch) {
				continue outer;
			}
		}
		return false;
	}
	return true;
}
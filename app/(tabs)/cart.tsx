import React, { useState, useEffect } from 'react';
import { StyleSheet, ImageBackground, FlatList, Image, View, Text, ScrollView, Pressable, Button} from 'react-native';
import * as Font from "expo-font";
import {router} from "expo-router";
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import * as size from "react-native-size-matters";



function toTitle(str : string) : string {
    if (str === undefined){
      return ""
    }
    str = str.replaceAll("_" , " ");
    const words = str.split(" ");
    for (let i = 0; i < words.length; i++) {
      try {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
      } catch(e){
        return ""
      }
    }

    return words.join(" "); 
  }

  function shortTitle(str : string) : string {
    if (str === undefined){
      return ""
    }
    
    const strTitle = toTitle(str);
    str = (strTitle == "") ? str : strTitle;

    const words = str.split(" ");
    if(words.length < 3){
      return str;
    }

    let three_words = [];

    for(let i = 0;i < 3;i++){
      if (words[i][0] === "("){
        continue;
      }
      three_words.push(words[i])
    }
    return three_words.join(" ") + " ..." 
  }




export default function TabTwoScreen() {
  const [data, setData] = useState<any>([]);
  const [req , setReq] = useState(0);
  fetchFonts();

  useEffect(() => {
    
  }, []); // Empty dependency array to run only once when the component mounts

  return (
    <View style={{flex : 1, backgroundColor : "#121212", paddingBottom : 40}}>
      <Image source={require("./juno_icon.png")} 
        style={{height : 100, width : 100, resizeMode : "cover", alignSelf : "center", marginTop : 10}} />
     <FlatList
          contentContainerStyle={{}}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={mockData}
          keyExtractor={(item) => item.vendor}
          renderItem={({ item }) => <Cart item={item}/>} 
        />
    </View>
  );
}
const fetchFonts = () => {
  return Font.loadAsync({
    'Poppins': require('./Poppins-Medium.ttf'),
    "Montserrat" : require("./Montserrat.ttf"),
  });
};



export function Cart (props : any) { 
  const vendor_data = props.item;
  // TODO : replace with actual shopify permalink
  const [uri, setUri] = useState("https://bonanzasatrangi.com/46417313955/checkouts/531f95efefddbac87d62de1968606d6c?note=This+was+order+was+placed+with+the+help+of+juno.&ref=JUNO")

  return(
    <View style={{marginTop : 40}}>
      
        <Text style={{marginTop : 10, color : "white", fontSize : 24, marginLeft : 14, fontFamily : "Poppins", }}>
          {toTitle(vendor_data.vendor)}</Text>
        <FlatList
          contentContainerStyle={{alignSelf: 'flex-start',marginLeft : 4, flexGrow : 1}}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={vendor_data.items}
          keyExtractor={(item) => item.product_id}
          renderItem={({ item }) => <Card item={item}/>} 
        />
        <Pressable
        style={[
          {
            paddingBottom: 16,
            paddingVertical: 10,
            marginHorizontal : 14,
            marginTop : 20,
            borderRadius: 4,
            alignItems: 'center',
            justifyContent: 'center'
          },
          { backgroundColor: "white" },
        ]}
        onPress={() => {
          router.navigate({
            pathname : "/browser",
            params : {
              uri : uri,
            }
          })
        }}
      >
        <Text style={{ fontSize: 18, color: "black", fontFamily : "Poppins" }}>Checkout</Text>
      </Pressable>
      </View>
  )
}


function Card(props : any){
  // TODO : make this navigate to /details on press

  // TODO : add proper quantity connected to backend
  const [quantity , setQuantity] = useState(1);


  return (
    <View style={{display : "flex", flexDirection : "row"}}>
      <Image
              style={{
                height : size.verticalScale(200), 
                width : size.verticalScale(120),
                marginHorizontal : size.moderateScale(8),
                marginVertical : size.verticalScale(5),
                borderRadius : 8,
              }}
              source={{ uri: props.item.image_url }}
            />
      <View style={{display : "flex" , flexDirection : "column"}}>
        <View style={{marginTop : size.verticalScale(20),}}>
          <Text style={{
            color : "white",
            marginHorizontal : 10,
            fontSize : 16,
            fontFamily : "Poppins",
            width : size.scale(140),
            }}>
              {props.item.title}
            </Text> 

            <Text style={{
            color : "gray",
            marginHorizontal : 10,
            marginVertical : 6,
            fontSize : 16,
            fontFamily : "Poppins",
            width : size.scale(140),
            }}>
              By {toTitle(props.item.vendor)}
            </Text> 
          <View style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginHorizontal: 10,
          }}>
            
            <Text style={{
              fontSize: 15, fontFamily: "Poppins",
              color : "white"
            }}>Rs. {props.item.price}</Text>
          </View>
        </View>

        <View style={{marginTop : size.verticalScale(60),marginHorizontal : 10, display : "flex" , flexDirection : "row"}}>
          <Pressable style={{width : 40, height : 40, borderRadius : 6}}
            onPress={() => {
              if (quantity < 1){
                return
              }
              if (quantity === 1){
                return
              }
              setQuantity(quantity - 1)
            }}
          >
            <Text style={{color : "gray", fontSize : 30, alignSelf : "center"}}>-</Text>
          </Pressable>
          <Text style={{marginHorizontal : 10, color : "white", fontSize : 23, alignSelf : "center"}}>{quantity}</Text>
          <Pressable style={{width : 40, height : 40, borderRadius : 6}}
            onPress={() => {
              if (quantity > 8){
                return
              }
              setQuantity(quantity + 1)
            }} 
          >
            <Text style={{color : "gray", fontSize : 30, alignSelf : "center"}}>+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}



const mockData = [
    {
        "vendor": "limelight",
        "items": [
            {
                "_id": "665d100edb4387ba28b8288f",
                "product_id": "c16f7322-519a-4857-ac8f-6d8b6fdf33c1",
                "product_url": "https://www.limelight.pk/products/p8642tp-xsm-frz",
                "shopify_id": 7611632549976,
                "handle": "p8642tp-xsm-frz",
                "title": "Lawn Kurti Embroidered (Pret)",
                "vendor": "limelight",
                "vendor_title": "Limelight",
                "category": "",
                "product_type": "Eastern Top-Old",
                "image_url": "https://cdn.shopify.com/s/files/1/2635/3244/files/DSC01789_cc559bb9-a107-4f4c-80e6-edb996397ff1.jpg?v=1711007094",
                "description": "\nKurti\nDyed embroidered shirt\nFabric: Lawn \n\nOther Details\nWeight: 146 g\nModel is wearing size \"S\"\n",
                "price": "2699",
                "currency": "PKR",
                "options": [
                    {
                        "name": "Size",
                        "position": 1,
                        "values": [
                            "Extra Small",
                            "Small",
                            "Medium",
                            "Large"
                        ]
                    }
                ],
                "tags": [
                    "Eastern Tops",
                    "Embroidered Short Kurti",
                    "Ritem | i211502-250-999",
                    "Ritem | i5712er-fre-gdn",
                    "Ritem | s0688sp-036-wht",
                    "sbp",
                    "Short Kurti",
                    "summer",
                    "Summer 24",
                    "video",
                    "women"
                ],
                "available": true
            },
            {
                "_id": "665d1014db4387ba28b831b6",
                "product_id": "88991256-571d-44db-b526-a40623932464",
                "product_url": "https://www.limelight.pk/products/i6928nk-fre-wht",
                "shopify_id": 7367370932312,
                "handle": "i6928nk-fre-wht",
                "title": "Classic Multi Strand Necklace",
                "vendor": "limelight",
                "vendor_title": "Limelight",
                "category": "",
                "product_type": "JWLRY",
                "image_url": "https://cdn.shopify.com/s/files/1/2635/3244/files/DSC_8442.jpg?v=1688468665",
                "description": "\nMulti-strand type necklace\nOne side of necklace is rope chain\nOne side of necklace embellished with pearls\nClasp closure \nColor: White \nMaterial: Metal \nWeight: 56 g\n\n",
                "price": "699",
                "currency": "PKR",
                "options": [
                    {
                        "name": "Title",
                        "position": 1,
                        "values": [
                            "Default Title"
                        ]
                    }
                ],
                "tags": [
                    "accessories",
                    "accessories sale",
                    "JEWELLERY",
                    "Jewelry",
                    "Necklaces",
                    "new on sale",
                    "old",
                    "sale",
                    "sale15",
                    "Summer 23",
                    "women",
                    "Women Accessories",
                    "women accessories sale",
                    "women sale"
                ],
                "available": true
            }
        ]
    },
    {
        "vendor": "sapphire",
        "items": [
            {
                "_id": "665d1039db4387ba28b852f6",
                "product_id": "a47790b6-2c44-4b0f-a2ac-3df0fefe97ea",
                "product_url": "https://pk.sapphireonline.pk/products/000002451gk1-1",
                "shopify_id": 7639011459146,
                "handle": "000002451gk1-1",
                "title": "Printed Cambric Top",
                "vendor": "sapphire",
                "vendor_title": "Sapphire",
                "category": "",
                "product_type": "Girls Top",
                "image_url": "https://cdn.shopify.com/s/files/1/1592/0041/files/000002451GK1_1.jpg?v=1715247831",
                "description": "Dress your little one in our white cambric front open loose top featuring a stylish front knot. Loose Top Front open Top with fabric knot at front, Printed Back, Printed Sleeves Colour: White Fabric: CambricSIZE & FITModel Height: 3 Feet 3 InchesModel Wears Size: 5/6 Years\n\n\n\n\nSize\n2/3\n3/4\n4/5\n5/6\n6/7\n7/8\n8/9\n9/10\n11/12\n\n\nLength\n12.5\n13.5\n14.5\n15.5\n15.5\n16\n16\n17\n17\n\n\nChest\n12\n13\n14\n15\n15.5\n16\n16.5\n17\n17.5\n\n\nSleeve Length\n6.75\n7.25\n7.75\n8.25\n8.5\n8.75\n9\n9.25\n9.5\n\n\n",
                "price": "1490",
                "currency": "PKR",
                "options": [
                    {
                        "name": "Size",
                        "position": 1,
                        "values": [
                            "2/3Y",
                            "3/4Y",
                            "4/5Y",
                            "5/6Y",
                            "6/7Y",
                            "7/8Y",
                            "8/9Y",
                            "9/10Y",
                            "11/12Y"
                        ]
                    }
                ],
                "tags": [
                    "000002451GK1",
                    "000002451GK1-size-chart",
                    "1 Piece",
                    "1000 - 3000",
                    "15-Percent-Tax",
                    "1PC",
                    "245-1GK-1",
                    "Animal kingdom & Florescent",
                    "Cambric",
                    "Casual",
                    "clothes",
                    "Girl",
                    "Girls",
                    "Girls all products",
                    "Girls East Wear",
                    "Girls Eastern",
                    "Girls Kurta",
                    "Girls Printed",
                    "Girls Shirt",
                    "girls-fusion-23",
                    "girls-fusion-tops-23",
                    "Kameez",
                    "kapde",
                    "Kids",
                    "Kids Branded Clothes",
                    "Kids Desi",
                    "Kids East",
                    "Kids Eastern Wear",
                    "Kids Ethnic",
                    "Kids Fusion",
                    "Kids Girls",
                    "Kids Kameez",
                    "Kids Kurta",
                    "Kids Loose Top",
                    "Kids Shirt",
                    "Kids Traditional",
                    "Kids-2nd-May-24",
                    "Kurta",
                    "Loose Top",
                    "New in Kids East 2024",
                    "New-all-2nd-May-24",
                    "new-in-june-2022",
                    "new-in-kids-2021",
                    "One Piece",
                    "pakistani",
                    "pakistani dresses",
                    "Pakistani Kids Clothes",
                    "Printed",
                    "salwar kameez design",
                    "Sapphire Kids",
                    "Shirt",
                    "Single Piece",
                    "size-chart",
                    "Stitched",
                    "Stitched Kids Clothes",
                    "Summer",
                    "Summer 24",
                    "Summer Clothing",
                    "Summer II Fusion 24 V-5",
                    "Summer Kids",
                    "Summer Kids Clothing",
                    "Summers",
                    "UAE_FREE_SHIPPING",
                    "White"
                ],
                "available": true
            }
        ]
    },
    {
        "vendor": "sadaf_fawad_khan",
        "items": [
            {
                "_id": "665d102fdb4387ba28b84b30",
                "product_id": "8b849f14-edd8-4ef9-bb94-25fbb1e81f7f",
                "product_url": "https://sadaffawadkhan.com/products/long-maxi",
                "shopify_id": 643793387566,
                "handle": "long-maxi",
                "title": "Flower Child",
                "vendor": "sadaf_fawad_khan",
                "vendor_title": "Sadaf Fawad Khan",
                "category": "",
                "product_type": "Formal",
                "image_url": "https://cdn.shopify.com/s/files/1/3006/7522/products/b_2.jpg?v=1528886891",
                "description": "Glamorous long blue maxi dress with gold pants.\n\nFabric : Tissue \n\nColour: Mint\nIncludes: Shirt, Pants and Dupatta\n\n",
                "price": "216450",
                "currency": "PKR",
                "options": [
                    {
                        "name": "Size",
                        "position": 1,
                        "values": [
                            "S",
                            "M",
                            "L",
                            "XS",
                            "XL"
                        ]
                    }
                ],
                "tags": [
                    "#Dress",
                    "#Embroidery",
                    "#eveningdress",
                    "#Eveningwear",
                    "#Fashion",
                    "#fashiondesigner",
                    "#formalmadetoorder",
                    "#Formals",
                    "#Glamour",
                    "#onlinefashion",
                    "#sadaffawadkhan",
                    "#Semiformal",
                    "#sfkdesigns",
                    "#sfkfashion",
                    "#sfkformals",
                    "#srastyle",
                    "#Style"
                ],
                "available": true
            }
        ]
    },
    {
        "vendor": "alkaram_studio",
        "items": [
            {
                "_id": "665d0f97db4387ba28b7e085",
                "product_id": "1036cd11-d2ef-48a7-8e13-4184b1534818",
                "product_url": "https://www.alkaramstudio.com/products/sling-bag-lhb-013-green",
                "shopify_id": 7495665189044,
                "handle": "sling-bag-lhb-013-green",
                "title": "Sling Bag",
                "vendor": "alkaram_studio",
                "vendor_title": "Alkaram Studio",
                "category": "",
                "product_type": "Handbag",
                "image_url": "https://cdn.shopify.com/s/files/1/0623/6481/1444/products/LHB-013_1.jpg?v=1704711869",
                "description": "Color: Green\nDiscover convenience and style in our crossbody sling bag featuring vibrant printed straps! ",
                "price": "2990",
                "currency": "PKR",
                "options": [
                    {
                        "name": "Title",
                        "position": 1,
                        "values": [
                            "Default Title"
                        ]
                    },
                    {
                        "name": "Color",
                        "position": 2,
                        "values": [
                            "Green"
                        ]
                    },
                    {
                        "name": "Material",
                        "position": 3,
                        "values": [
                            "Fabric"
                        ]
                    }
                ],
                "tags": [
                    "'-New In",
                    "Bags",
                    "Beauty & Accessories",
                    "Cross Body Bags",
                    "Footwear & Handbag",
                    "Handbags",
                    "show-quickview",
                    "Uploaded-08-Jan-24"
                ],
                "available": true
            },
            {
                "_id": "665d0f98db4387ba28b7e236",
                "product_id": "e902cbdd-3127-43b0-9d38-ec8a5b3e332a",
                "product_url": "https://www.alkaramstudio.com/products/3-pc-embroidered-lawn-suit-with-yarn-dyed-dupatta-m-17-24-purple",
                "shopify_id": 7512715100340,
                "handle": "3-pc-embroidered-lawn-suit-with-yarn-dyed-dupatta-m-17-24-purple",
                "title": "3 Pc Embroidered Lawn Suit With Yarn Dyed Dupatta",
                "vendor": "alkaram_studio",
                "vendor_title": "Alkaram Studio",
                "category": "",
                "product_type": "Suit",
                "image_url": "https://cdn.shopify.com/s/files/1/0623/6481/1444/products/M-17-24-Purple-1.jpg?v=1707477293",
                "description": "Unstitched 3-Piece\nEmbroidered Lawn Suit With Yarn Dyed Dupatta \nColor: Purple  \nShirt::\nEmbroidered Lawn Shirt 3.13 Meters \nOrganza Border for Front \nOrganza Border for Sleeve 1.8 Meters \nFabric: Lawn  \nDupatta::\nYarn Dyed Dupatta 2.50 Meters \nFabric: Yarn Dyed  \nTrouser: :\nDyed Cambric Trouser 1.80 Meters  \nFabric:  Cambric  \nCare Instructions: \n\nDry Clean Only\"\" \n\n\n\"",
                "price": "7990",
                "currency": "PKR",
                "options": [
                    {
                        "name": "Color",
                        "position": 1,
                        "values": [
                            "Purple"
                        ]
                    },
                    {
                        "name": "Fabric",
                        "position": 2,
                        "values": [
                            "Lawn"
                        ]
                    }
                ],
                "tags": [
                    "3 Piece Fabrics",
                    "Eid Edit New",
                    "Embroidered",
                    "Luxury",
                    "Meraki",
                    "New In",
                    "show-quickview",
                    "Unstitched",
                    "Uploaded-09-feb-24",
                    "Woman",
                    "Woman Eid Edit",
                    "Woman Unstitched"
                ],
                "available": true
            }
        ]
    },
    {
        "vendor": "edenrobe",
        "items": [
            {
                "_id": "665d0fcedb4387ba28b7fd8b",
                "product_id": "be576ee2-85cc-4b13-86d4-79a3700350a0",
                "product_url": "https://edenrobe.com/products/girls-royal-blue-frock-egtf24s-200056",
                "shopify_id": 9170775507217,
                "handle": "girls-royal-blue-frock-egtf24s-200056",
                "title": "Girl'S Royal Blue Frock   Egtf24S 200056",
                "vendor": "edenrobe",
                "vendor_title": "Edenrobe",
                "category": "",
                "product_type": "Girls Frocks",
                "image_url": "https://cdn.shopify.com/s/files/1/0841/3796/7889/products/24_G_GirlsFrocks_EGTF24S-200056_1.jpg?v=1710149519",
                "description": "\nGirl's Frock\nRegular Fit\nDobby Fabric\n",
                "price": "5618",
                "currency": "PKR",
                "options": [
                    {
                        "name": "Size",
                        "position": 1,
                        "values": [
                            "02-3y",
                            "04y",
                            "05y",
                            "06y",
                            "07-8y",
                            "09-10y",
                            "11-12y",
                            "13-14y"
                        ]
                    },
                    {
                        "name": "Color",
                        "position": 2,
                        "values": [
                            "Blue"
                        ]
                    }
                ],
                "tags": [
                    "25_discount",
                    "Fall_Season",
                    "New",
                    "Regular_fit",
                    "Spring_Season",
                    "Summer_Season",
                    "Upto_50_discount"
                ],
                "available": true
            }
        ]
    }
]



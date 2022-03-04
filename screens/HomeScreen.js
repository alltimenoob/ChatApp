// @refresh reset
import { useNavigation } from '@react-navigation/native'
import React, { useEffect , useState , useCallback, useRef } from 'react'
import { StyleSheet,Text,TouchableOpacity,TextInput,View,KeyboardAvoidingView,FlatList,Image,Keyboard} from 'react-native'
import { auth ,db} from '../firebase'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';  
import { collection,doc,query,where,onSnapshot,setDoc,getDocs} from 'firebase/firestore'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'

const chatRef = collection(db,'chats')

const HomeScreen = () =>{
    const [send,setSend] = useState(false)
    const [user,setUser] = useState()
    const navigation = useNavigation()
    const inputMessage = useRef()
    const [messages , setMessages ] = useState([])
    const [messageText,setMessageText] = useState(" ")
    const [image,setImage] = useState(null) 
    const isMounted = useRef(null);

    useEffect(() => {
      // executed when component mounted
      isMounted.current = true;
      return () => {
        // executed when unmount
        isMounted.current = false;
      }
    }, []);

    async function getUser()
    {
        const id = auth.currentUser?.email
        const q = query(collection(db, "users"), where("email", "==", id));
        const d = await getDocs(q)
        d.forEach((data)=>{
            setUser({id:data.data().email,name:data.data().name})
        })
    }

    async function getLocalMessages()
    {
        const dataFromStorage = await AsyncStorage.getItem('@messages');
        const data = [JSON.parse(dataFromStorage)]
        console.log(dataFromStorage)
        if(data !== null) {
            return data
        }
        return null
    }

    async function setLocalMessages(value)
    { 
        const dataFromStorage = await AsyncStorage.getItem('@messages');
        const data = JSON.parse(dataFromStorage)
        if(data !== null) {
           messages.push(value)
        }

        
    }

    useEffect(()=>{ 
        getUser()
        const localMessages = getLocalMessages()
        
        if(localMessages!=null)
        {
            
        }

        const unsub = new Promise(()=>onSnapshot(chatRef,(snapshot)=>{
            const messages = snapshot.docChanges().filter(({type})=> type==='added')
            .map(({doc}) => {
                const message = doc.data()
                setLocalMessages(message)
                return {...message, 'createdAt': message.createdAt}
            })
            .sort((a,b)=>b.createdAt - a.createdAt)
            
        }))
        
        return () => unsub()
    },[]);

    
    const appendMessages = useCallback((m)=>{
        setMessages((previous)=>m.concat(previous))
    },[messages])

    async function getImage() {
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
        
        if (permissionResult.granted === false) {
            alert("Permission to access camera roll is required!");
            return;
        }

        let pickerResult = await ImagePicker.launchImageLibraryAsync({
            title: 'Choose an Image',
            base64: true
         });
        
        if(pickerResult.cancelled == false && pickerResult.type == "image" )
        {
            
            const manipResult = await manipulateAsync(pickerResult.uri,
                [{ resize: { width: 500 } }],
                { compress: 1, format : SaveFormat.JPEG }
                );
               
            setImage(manipResult);
            setSend(true)
        }

    }


    function getDate(element)
    {
        const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                        ];
        let date = new Date(element.createdAt).getDate()
        let month= new Date(element.createdAt).getMonth()
        let year = new Date(element.createdAt).getFullYear()

        return date+" "+monthNames[month]+" "+year
    }

    function getTime(element)
    {
        let time;
        let hours = new Date(element.createdAt).getHours()
        let minute = new Date(element.createdAt).getMinutes()
        if(hours > 12)
        {
            hours = hours % 12
            hours= (hours<1)?12:hours

            time = ("0" + hours).slice(-2) + ":" + ("0" + minute).slice(-2) + " PM" 
        }
        else
        {
            hours= (hours<1)?12:hours
            time = ("0" + hours).slice(-2) + ":" + ("0" + minute).slice(-2) + " AM" 
        }
        return time
    }
  
    /*const appendMessages = useCallback((messages) => {
        setMessages((previous) => GiftedChat.append(previous , messages) )
    },[messages])
*/
   
    const handleSignOut = () => {
        auth.signOut()
        .then(()=>{
            navigation.replace("Login")
        })
        .catch(error => alert(error.message))
    }
    
    function renderChat() {
        let date = (messages[0]!=undefined)? getDate(messages[messages.length-1]):"Today";
        let headerDate = date
        return (
            <FlatList 
            inverted
            style={{width:'100%'}}
                data={messages}
                extraData={messages}
                ListFooterComponent={<Text style={styles.header}>{date}</Text>}
                renderItem={({item})=>
                <View>
                    <Text style={(item.user.id === auth.currentUser?.email)?
                styles.rightmessageName : styles.leftmessageName}>{item.user.name}</Text>
                <View style={(item.user.id === auth.currentUser?.email)?
                styles.rightchat : styles.leftchat }>
                    {(item.data)?<Image source={{uri: `data:image/jpeg;base64,${item.data}`}}  style={{width:250,height:250,borderRadius:20,marginBottom:10}}/>:null}
                    <Text numberOfLines={99999} ellipsizeMode='tail'
                        style={(item.user.id === auth.currentUser?.email)?
                            styles.rightmessageText : styles.leftmessageText }>{item.text}</Text>
                    <Text style={(item.user.id === auth.currentUser?.email)?
                        styles.rightmessageTime : styles.leftmessageTime }>{getTime(item)}</Text>
                </View>
                </View>}
                ItemSeparatorComponent={(item)=>{

                    if(getDate(item.leadingItem)!=date&&getDate(item.leadingItem)!=headerDate)
                    {
                        date = getDate(item.leadingItem)
                        return <Text style={styles.header}>{getDate(item.leadingItem)}</Text>
                    }
                    else
                    {
                        return null
                    }
                }}>
            </FlatList>
        );
    }

    function renderImageSelector()
    {
        return(
            <View style={{flex:1,width:'100%',height:'100%',alignItems:'center',justifyContent:'center'}}>
            <View style={styles.imageContainer}>
                <Image source={{uri:image.uri}} style={styles.image}/>
            </View>
            </View>)
    }

    async function handleSend() {
        
        if(image)
        {
            const data = await manipulateAsync(image.uri,
                [{ resize: { width: 500 } }],
                { compress: 1, format : SaveFormat.JPEG,base64:true });
        
            const msg= {id:Math.random(10).toString(36).substring(7),text:messageText,data:data.base64,createdAt:new Date().getTime(),user:user}
          
            
            setDoc(doc(db,'chats',Math.random(45).toString(36).substring(7)),msg)
            

            /*console.log(encodeURI(JSON.stringify(msg)).split(/%..|./).length - 1)*/
            
            
        }
        else
        {
            const msg= {id:Math.random(10).toString(36).substring(7),text:messageText,data:"",createdAt:new Date().getTime(),user:user}
          
            
            setDoc(doc(db,'chats',Math.random(45).toString(36).substring(7)),msg)
        }
       
        setImage(null)
        setMessageText(null)
        inputMessage.current.clear()
    }


    return(
        <SafeAreaView style={{width:'100%',height:'100%'}}>
        <KeyboardAvoidingView style={styles.container} onPress={Keyboard.dismiss} behavior={Platform.OS === "ios" ? "padding" : null}>
            <View style={styles.profilebar}>
                <Text style={styles.welcometext}>Welcome To Chat Room</Text>
                <TouchableOpacity style={styles.signoutbutton} onPress={handleSignOut}> 
                    <Text style={styles.signouttext}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            {(image)?renderImageSelector():renderChat()}
            <View style={styles.messageInputContainer}>
                <TouchableOpacity onPress={ getImage } style={styles.button}>
                    <Image source={require('../assets/camera.png')} style={{width:30,height:30} } />
                </TouchableOpacity>
                <TextInput 
                ref={inputMessage}
                value={messageText}
                placeholder="Enter Message" 
                onChangeText={(text)=>{setMessageText(text);(text.length>0)?setSend(true):setSend(false)}}
                style={styles.messageInput}
                >
                </TextInput>
                {send&&<TouchableOpacity onPress={handleSend} style={styles.button}>
                    <Image source={require('../assets/send.png')} style={styles.sendbutton} />
                </TouchableOpacity>}
            </View>
        </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    container:{
        flex:1,
        width:'100%',
        backgroundColor:'#fff',
        alignItems:'center',
        justifyContent:'flex-end',
    },
   
    sendbutton:{
        height:25,
        width:25,
    },
    
    messageInputContainer:{
        marginLeft:10,
        marginRight:10,
        width:'100%',
        borderWidth:2,
        borderColor:'#FF5500',
        flexDirection:'row',
    },

    button:{
        width:'20%',
        backgroundColor:"#FF5500",
        alignItems:'center',
        justifyContent:'center'
    },

    messageInput:{
        minWidth:'60%',
        padding:15,
        backgroundColor:'white',
        alignSelf:'flex-start',
    },

    leftchat:{
        minWidth:100,
        maxWidth:'80%',
        padding:10,
        borderWidth:1,
        borderRadius:27,
        marginStart:5,
        marginBottom:10,
        alignSelf:'flex-start',
        justifyContent:'space-between',
        flexDirection:'column',
        borderColor:'#FF5500',
    },

    rightchat:{
        minWidth:100,
        maxWidth:'80%',
        backgroundColor:'#FF5500',
        padding:10,
        borderWidth:1,
        borderRadius:25,
        marginEnd:5,
        marginBottom:10,
        alignSelf:'flex-end',
        justifyContent:'space-between',
        flexDirection:'column',
        borderColor:'#FFF',
        overflow: 'hidden',
        color:"#FFF",
    },

    rightmessageName:{
        fontSize:10,
        color:'#111111',
        marginEnd:10,
        alignSelf:'flex-end'
    },
    leftmessageName:{
        fontSize:10,
        color:'#111111',
        marginStart:10,
        alignSelf:'flex-start'
    },
    rightmessageText:{
        alignSelf:'flex-start',
        color:'white',
        marginStart:5,
        marginTop:1,
        fontSize:15,
    },
    leftmessageText:{
        alignSelf:'flex-start',
        color:'black',
        marginStart:5,
        marginTop:1,
        fontSize:15,
    },
    rightmessageTime:{
        fontSize:10,
        color:'grey',
        marginTop:1,
        fontWeight:'700',
        marginStart:10,
        color:'white',
        alignSelf:'flex-end'
    },
    leftmessageTime:{
        fontSize:10,
        fontWeight:'700',
        marginTop:1,
        marginStart:10,
        alignSelf:'flex-end'
    },
    profilebar:{
        flexDirection:'row',
        width:'100%',
        height:'7%',
        justifyContent:'space-between',
        backgroundColor:'#F8F8F8',
        borderBottomWidth:1,
        borderBottomColor:'#E1E1E1'
    },
    signoutbutton:{
        marginEnd:'10%',
        justifyContent:'center',
        alignSelf:'flex-end',
        height:'100%',
    },
    welcometext:{
        marginStart:'10%',
        color:'#FF5500',
        alignSelf:'center',
        fontSize:14,
        fontWeight:'900'
    },
    signouttext:{
        alignSelf:'center',
        color:'#77777E',
        fontSize:14,
        fontWeight:'900',
    },
    header:{
        padding:10,
        backgroundColor:'#F8F8F8',
        borderRadius:20,
        overflow:'hidden',
        alignSelf:'center',
    },

    image:{
        width: "100%",
        height: "100%",
        resizeMode:'contain'
    },
    imageContainer:{
        width: "100%",
        height: "80%",
        backgroundColor:'#EEEEEE',
    },
    sendimagebuttonContainer:{
        padding:10,
        borderRadius:10,
        borderWidth:2,
        borderColor:'#FF5500',
        backgroundColor:'#FF5500'
    },
    sendimageButton:{
        color:'white',
        padding:10,
    }

})
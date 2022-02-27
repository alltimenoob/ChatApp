// @refresh reset
import { useNavigation } from '@react-navigation/native'
import React, { useEffect , useState , useCallback, useRef} from 'react'
import { StyleSheet,Text,TouchableOpacity,TextInput,View,KeyboardAvoidingView,FlatList,Image } from 'react-native'
import { auth ,db} from '../firebase'
import { collection,doc,async,query,where,onSnapshot,setDoc,getDocs} from 'firebase/firestore'
import { SafeAreaView } from 'react-native-safe-area-context'
const chatRef = collection(db,'chats')

const HomeScreen = () =>{
    const [send,setSend] = useState(false)
    const [user,setUser] = useState()
    const navigation = useNavigation()
    const inputMessage = useRef()
    const [messages , setMessages ] = useState([])
    const [messageText,setMessageText] = useState() ;


    async function getUser()
    {
        const id = auth.currentUser?.email
        const q = query(collection(db, "users"), where("email", "==", id));
        const d = await getDocs(q)
        d.forEach((data)=>{
            setUser({id:data.data().email,name:data.data().name})
        })
    }

    useEffect(()=>{ 
        getUser()
        const unsub = onSnapshot(chatRef,(snapshot)=>{
            const messages = snapshot.docChanges().filter(({type})=> type==='added')
            .map(({doc}) => {
                const message = doc.data()
                return {...message, 'createdAt': message.createdAt}
            })
            .sort((a,b)=>b.createdAt - a.createdAt)
            appendMessages(messages)
        })
        return () => unsub()
    },[]);


    const appendMessages = useCallback((messages)=>{
        setMessages((previous)=>messages.concat(previous))
    },[messages])

    function getTime(element)
    {
        let time;
        let hours = new Date(element.createdAt).getHours()
        let minute = new Date(element.createdAt).getMinutes()
        if(hours > 12)
        {
             time = (hours - 12) + ":" + minute + " PM" 
        }
        else
        {
             time = hours + " : " + minute + "AM" 
        }
        return time
    }
  
    /*const appendMessages = useCallback((messages) => {
        setMessages((previous) => GiftedChat.append(previous , messages) )
    },[messages])
*/
    function handleSend() {
       
        inputMessage.current.clear()
        getM().map((m)=>{setDoc(doc(db,'chats',Math.random().toString(36).substring(7)),m)})
    }

    const handleSignOut = () => {
        auth.signOut()
        .then(()=>{
            navigation.replace("Login")
        })
        .catch(error => alert(error.message))
    }
    
    function render() {
        return (
            <FlatList 
            inverted
            style={{width:'100%'}}
                data={messages}
                extraData={messages}
                renderItem={({item})=>
                <View>
                    <Text style={(item.user.id === auth.currentUser?.email)?
                styles.rightmessageName : styles.leftmessageName}>{item.user.name}</Text>
                <View style={(item.user.id === auth.currentUser?.email)?
                styles.rightchat : styles.leftchat }>
                    <Text numberOfLines={99999} ellipsizeMode='tail'
                        style={(item.user.id === auth.currentUser?.email)?
                            styles.rightmessageText : styles.leftmessageText }>{item.text}</Text>
                    <Text style={(item.user.id === auth.currentUser?.email)?
                styles.rightmessageTime : styles.leftmessageTime }>{getTime(item)}</Text>
                </View>
                </View>}>
            </FlatList>
        );
    }

    function getM(){
        const message = [{id:Math.random(10).toString(36).substring(7),text:messageText,createdAt:new Date().getTime(),user:user}]
        return message
    }

    return(
        <SafeAreaView style={{width:'100%',height:'100%'}}>
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <View style={styles.profilebar}>
                <Text style={styles.welcometext}>Welcome To Chat Room</Text>
                <TouchableOpacity style={styles.signoutbutton} onPress={handleSignOut}> 
                    <Text style={styles.signouttext}>Sign Out</Text>
                </TouchableOpacity>
            </View>
            {render()}
            <View style={styles.messageInputContainer}>
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
        marginBottom:10,
        width:'100%',
        flexDirection:'row',
        borderRadius:25,
        borderWidth:1,
        borderColor:"#FF5500"
    },

    button:{
        width:'20%',
        borderTopRightRadius:20,
        borderBottomRightRadius:20,
        backgroundColor:"#FF5500",
        alignItems:'center',
        justifyContent:'center'
    },

    messageInput:{
        width:"80%",
        borderRadius:25,
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
    }
})
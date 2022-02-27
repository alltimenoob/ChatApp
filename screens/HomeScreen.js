// @refresh reset
import { useNavigation } from '@react-navigation/native'
import React, { useEffect , useState , useCallback, useRef} from 'react'
import { StyleSheet,Text,TouchableOpacity,TextInput,View,KeyboardAvoidingView,FlatList,ListItem } from 'react-native'
import { auth ,db} from '../firebase'
import { collection,doc,onSnapshot,setDoc} from 'firebase/firestore'
import { SafeAreaView } from 'react-native-safe-area-context'
const chatRef = collection(db,'chats')


const HomeScreen = () =>{
    const [user , setUser] = useState()
    const navigation = useNavigation()
    const inputMessage = useRef()
    const [messages , setMessages ] = useState([])
    const [messageText,setMessageText] = useState() ;

    useEffect(()=>{ 
        setUser({ _id : auth.currentUser?.email })
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

    /*const appendMessages = useCallback((messages) => {
        setMessages((previous) => GiftedChat.append(previous , messages) )
    },[messages])
*/
    function handleSend() {
        inputMessage.current.clear()
        getM().map(m=>{console.log(m);setDoc(doc(db,'chats',Math.random().toString(36).substring(7)),m)})
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
                <Text style={(item.user._id === auth.currentUser?.email)?
                {alignSelf:'flex-end',paddingEnd:10} : {alignSelf:'flex-start',paddingStart:10} }>{item.user._id}</Text>
                <Text style={(item.user._id === auth.currentUser?.email)?
                styles.rightchat : styles.leftchat }>{item.text}</Text></View>}> 
            </FlatList>
        );
    }

    function getM(){
        const message = [{id:Math.random(10).toString(36).substring(7),text:messageText,createdAt:new Date().getTime(),user:user}]
        console.log(messageText)
        return message
    }

    return(
        <SafeAreaView style={{width:'100%',height:'100%'}}>
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            {render()}
            <View style={styles.messageInputContainer}>
                <TextInput 
                ref={inputMessage}
                value={messageText}
                placeholder="Enter Message" 
                onChangeText={text=>setMessageText(text)}
                style={styles.messageInput}
                >
                </TextInput>
                <TouchableOpacity onPress={handleSend} style={styles.button}>
                    <Text style={styles.buttonText}>Send</Text>
                </TouchableOpacity>
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
   
    buttonText:{
        color:'white',
        fontWeight:"700",
        fontSize:16,
    },
    
    messageInputContainer:{
        width:'100%',
        flexDirection:'row',
        borderRadius:10,
        borderWidth:2,
        borderColor:"#FF5500"
    },

    button:{
        width:'20%',
        padding:15,
        borderTopRightRadius:5,
        borderBottomRightRadius:5,
        backgroundColor:"#FF5500",
        alignItems:'center'
    },

    messageInput:{
        width:"80%",
        borderRadius:10,
        padding:15,
        backgroundColor:'white',
        alignSelf:'flex-start',
    },

    leftchat:{
        padding:15,
        borderWidth:2,
        borderRadius:10,
        marginTop:5,
        marginBottom:5,
        marginStart:5,
        alignSelf:'flex-start',
        borderColor:'#FF5500',
    },

    rightchat:{
        padding:15,
        borderWidth:2,
        borderRadius:10,
        marginTop:5,
        marginBottom:5,
        marginEnd:5,
        alignSelf:'flex-end',
        borderColor:'#FF5500',
    },

})